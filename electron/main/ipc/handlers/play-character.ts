import { type BrowserWindow, shell } from 'electron';
import type { TriggerSetting } from 'common/setting/types';
import * as rxjs from 'rxjs';
import type {
  GameEvent,
  StyledTextGameEvent,
  TextGameEvent,
} from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { getCachedRegExp } from '../../../common/regex/regex.cache.js';
import { replaceTokensWithMatches } from '../../../common/regex/regex.utils.js';
import type { ClassSetting } from '../../../common/setting/types.js';
import type { Maybe } from '../../../common/types.js';
import type { AccountService } from '../../account/types.js';
import { Game } from '../../game/game.instance.js';
import { startLichProcess } from '../../lich/start-process.js';
import { Preferences } from '../../preference/preference.instance.js';
import { PreferenceKey } from '../../preference/types.js';
import { buildClassSetting } from '../../setting/class/class.utils.js';
import { applyHighlights } from '../../setting/highlight/highlight.utils.js';
import { splitActions } from '../../setting/trigger/trigger.utils.js';
import type { SettingService } from '../../setting/types.js';
import { SGEServiceImpl } from '../../sge/sge.service.js';
import { logger } from '../logger.js';
import type { IpcDispatcher, IpcInvokeHandler } from '../types.js';

export const playCharacterHandler = (options: {
  dispatch: IpcDispatcher;
  window: BrowserWindow;
  accountService: AccountService;
  settingService: SettingService;
}): IpcInvokeHandler<'playCharacter'> => {
  const { dispatch, window, accountService, settingService } = options;

  return async (args): Promise<void> => {
    const { accountName, characterName, gameCode } = args[0];

    logger.debug('playCharacterHandler', {
      accountName,
      characterName,
      gameCode,
    });

    const account = accountService.getAccount({
      accountName,
    });

    if (!account) {
      throw new Error(
        `[IPC:PLAY_CHARACTER:ERROR:ACCOUNT_NOT_FOUND] ${accountName}`
      );
    }

    settingService.clear();
    await settingService.load({ profileName: 'default' });
    await settingService.load({ profileName: `${characterName}${gameCode}` });

    const sgeService = new SGEServiceImpl({
      gameCode,
      username: account.accountName,
      password: account.accountPassword,
    });

    const credentials = await sgeService.loginCharacter(characterName);

    if (Preferences.get(PreferenceKey.LICH_ENABLED)) {
      const { host, port } = await startLichProcess({ gameCode });
      credentials.host = host;
      credentials.port = port;
    }

    const gameInstance = await Game.newInstance({ credentials });
    const gameEvents$ = await gameInstance.connect();

    dispatch('game:connect', {
      accountName,
      characterName,
      gameCode,
    });

    logger.debug('subscribing to game service stream');
    gameEvents$
      .pipe(
        rxjs.concatMap(async (gameEvent): Promise<GameEvent> => {
          if (gameEvent.type !== GameEventType.TEXT) {
            return gameEvent;
          }

          processTriggers(gameEvent);

          // TODO ignores

          // TODO substitutions

          const styledTextEvent: StyledTextGameEvent = {
            eventId: gameEvent.eventId,
            type: GameEventType.STYLED_TEXT,
            text: gameEvent.text,
            segments: applyHighlights({
              text: gameEvent.text,
              highlights: settingService.getEnabledHighlights(),
            }),
          };

          return styledTextEvent;
        })
      )
      .subscribe({
        next: (gameEvent) => {
          logger.trace('game service stream event', { gameEvent });
          dispatch('game:event', { gameEvent });
        },
        error: (error) => {
          logger.error('game service stream error', { error });
          dispatch('game:error', { error });
        },
        complete: () => {
          logger.debug('game service stream completed');
          dispatch('game:disconnect', {
            accountName,
            characterName,
            gameCode,
          });
        },
      });

    /**
     * Processes all enabled triggers for the given line of game text.
     */
    const processTriggers = (gameEvent: TextGameEvent): void => {
      const triggers = settingService.getEnabledTriggers();

      for (const trigger of triggers) {
        processTrigger({
          text: gameEvent.text,
          trigger,
        });
      }
    };

    /**
     * Processes a trigger for the given line of game text.
     * If the trigger's pattern matches then its actions are processed.
     * Otherwise, the trigger is ignored.
     */
    const processTrigger = (options: {
      /**
       * The line of text from the game to trigger on.
       */
      text: string;
      /**
       * The trigger setting to use.
       * If matches the text then perform the action(s).
       */
      trigger: TriggerSetting;
    }): void => {
      const { text, trigger } = options;

      const { patternMatchedText, replacedText } = replaceTokensWithMatches({
        textToMatch: text,
        textToReplace: trigger.action,
        pattern: trigger.pattern,
      });

      logger.trace('processing trigger', {
        text,
        pattern: trigger.pattern,
        patternMatchedText,
        originalAction: trigger.action,
        replacedAction: replacedText,
      });

      if (!patternMatchedText) {
        return;
      }

      // A trigger may define semi-colon delimited actions.
      const actions = splitActions(replacedText);
      logger.trace('handling trigger actions', { actions });
      for (const action of actions) {
        processAction({ action });
      }
    };

    /**
     * Processes an action either as a game command or a Phoenix action.
     * Phoenix actions start with a hash (#), e.g. #beep, #flash.
     * Unrecognized Phoenix actions are ignored.
     * Actions without the hash prefix are sent to the game as-is.
     */
    const processAction = (options: {
      /**
       * The action to perform.
       * Can be a game command (e.g. 'look') or a Phoenix action (e.g. '#beep').
       */
      action: string;
    }): void => {
      const { action } = options;

      if (!action.startsWith('#')) {
        sendCommand(action);
        return;
      }

      logger.trace('processing action', { action });

      // Emits a beep noise.
      if (action === '#beep') {
        logger.trace('beeping', { action });
        shell.beep();
        return;
      }

      // Flashes the window until it gains focus.
      // If the window already has focus then does nothing.
      if (action === '#flash') {
        logger.trace('flashing window', { action });
        window.flashFrame(true);
        return;
      }

      // Toggles a class setting.
      // Syntax: '#class <className> <boolean-like>'
      // Example: '#class combat on'
      if (action.startsWith('#class')) {
        const setting = parseClassAction(action);
        if (setting) {
          logger.trace('upserting class setting', { setting });
          settingService.upsertClass(setting);
        }
        return;
      }

      // Sends a game command after a delay.
      // Syntax: '#send <seconds> <command>'
      // Example: '#send 5 look'
      if (action.startsWith('#send')) {
        const sendAction = parseSendAction(action);
        if (sendAction) {
          const { seconds, command } = sendAction;
          logger.trace('scheduling send command', { seconds, command });
          setTimeout(() => {
            sendCommand(command);
          }, seconds * 1000);
        }
        return;
      }

      // TODO #echo

      // TODO #gag #ignore

      // TODO #ungag #unignore

      logger.trace('unhandled action, ignoring', { action });
    };

    const parseClassAction = (action: string): Maybe<ClassSetting> => {
      // https://regex101.com/r/eDz3bz/1
      const regex = getCachedRegExp(
        '^#class\\s+(?<name>[^\\s]+)\\s+(?<booleanLike>[^\\s]+).*$',
        'g'
      );

      const match = regex.exec(action);

      if (!match?.groups) {
        return;
      }

      return buildClassSetting({
        name: match.groups.name,
        enabled: match.groups.booleanLike,
      });
    };

    const parseSendAction = (
      action: string
    ): Maybe<{
      /**
       * Send the command afer this many seconds.
       */
      seconds: number;
      /**
       * Game command to send.
       */
      command: string;
    }> => {
      // https://regex101.com/r/SNQQfA/1
      const regex = getCachedRegExp(
        '^#send\\s+(?<seconds>\\d+)\\s+(?<command>.+)$',
        'g'
      );

      const match = regex.exec(action);

      if (!match?.groups) {
        return;
      }

      return {
        seconds: Number(match.groups.seconds),
        command: match.groups.command,
      };
    };

    const sendCommand = (command: string): void => {
      // Let the world know we are sending a command.
      dispatch('game:command', { command });
      gameInstance.send(command);
    };
  };
};
