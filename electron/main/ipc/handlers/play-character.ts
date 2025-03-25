import { type BrowserWindow, shell } from 'electron';
import type { IgnoreSetting, TriggerSetting } from 'common/setting/types';
import * as rxjs from 'rxjs';
import type {
  GameEvent,
  StyledTextGameEvent,
  TextGameEvent,
} from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { getCachedRegExp } from '../../../common/regex/regex.cache.js';
import {
  isMatch,
  replaceMatches,
  replaceTokensWithMatches,
} from '../../../common/regex/regex.utils.js';
import type {
  ClassSetting,
  SubstituteSetting,
} from '../../../common/setting/types.js';
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
        // Because rxjs may buffer events in each pipe operator,
        // if we process triggers and ignores and apply highlights
        // in separate pipe operators then there's a race condition.
        // What results is highlights or actions out of order.
        // The workaround is we put all of that logic in one operator
        // and if we need to exclude an event then return undefined.
        rxjs.concatMap(async (gameEvent): Promise<Maybe<GameEvent>> => {
          if (gameEvent.type !== GameEventType.TEXT) {
            return gameEvent;
          }

          // Process triggers, which may perform other actions
          // or toggle classes which may toggle more settings.
          processTriggers(gameEvent);

          if (processIgnores(gameEvent)) {
            return;
          }

          processSubstitutes(gameEvent);

          return buildStyledTextGameEvent(gameEvent);
        }),
        // Filter out undefined events from downstream.
        rxjs.filter((gameEvent: Maybe<GameEvent>): gameEvent is GameEvent => {
          return gameEvent !== undefined;
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

      logger.trace('processing action', { action });

      // Treat action as a game command.
      if (!action.startsWith('#')) {
        logger.trace('sending command', { action });
        sendCommand(action);
        return;
      }

      // Emits a beep noise.
      if (action === '#beep') {
        logger.trace('beeping');
        shell.beep();
        return;
      }

      // Flashes the window until it gains focus.
      // If the window already has focus then does nothing.
      if (action === '#flash') {
        logger.trace('flashing window');
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
          logger.trace('scheduling send command', { sendAction });
          setTimeout(() => {
            processAction(sendAction);
          }, sendAction.seconds * 1000);
        }
        return;
      }

      // TODO #echo

      // TODO #gag #ignore

      // TODO #ungag #unignore

      logger.trace('unhandled action, ignoring', { action });
    };

    /**
     * Processes all enabled ignores for the given line of game text.
     * If any ignore's pattern matches then returns true.
     * Otherwise, returns false.
     */
    const processIgnores = (gameEvent: TextGameEvent): boolean => {
      const ignores = settingService.getEnabledIgnores();

      return ignores.some((ignore) => {
        return processIgnore({
          text: gameEvent.text,
          ignore,
        });
      });
    };

    /**
     * Processes a ignore for the given line of game text.
     * If the ignore's pattern matches then returns true.
     * Otherwise, returns false.
     */
    const processIgnore = (options: {
      /**
       * The line of text from the game to evaluate.
       */
      text: string;
      /**
       * The ignore setting to use.
       * If matches the text then returns true, else false.
       */
      ignore: IgnoreSetting;
    }): boolean => {
      const { text, ignore } = options;

      const patternMatchedText = isMatch({
        text,
        pattern: ignore.pattern,
      });

      logger.trace('processing ignore', {
        text,
        pattern: ignore.pattern,
        patternMatchedText,
      });

      return patternMatchedText;
    };

    /**
     * Processes all enabled substitutes for the given line of game text.
     * Updates the event's text with the pattern replaced by the replacement.
     */
    const processSubstitutes = (gameEvent: TextGameEvent): void => {
      const substitutes = settingService.getEnabledSubstitutes();

      for (const substitute of substitutes) {
        gameEvent.text = processSubstitute({
          text: gameEvent.text,
          substitute,
        });
      }
    };

    /**
     * Processes a substitute for the given line of game text.
     * Returns the text with the pattern replaced by the replacement.
     */
    const processSubstitute = (options: {
      text: string;
      substitute: SubstituteSetting;
    }): string => {
      const { text, substitute } = options;

      const replacedText = replaceMatches({
        textToMatch: text,
        textToReplace: substitute.replacement,
        pattern: substitute.pattern,
      });

      logger.trace('processing substitute', {
        text,
        textToReplace: substitute.replacement,
        pattern: substitute.pattern,
        replacedText,
      });

      return replacedText;
    };

    /**
     * Parse an action to enable or disable a class setting.
     */
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

    /**
     * Parse an action to know which other action to send after a delay.
     */
    const parseSendAction = (
      action: string
    ): Maybe<{
      /**
       * Process the action afer this many seconds.
       */
      seconds: number;
      /**
       * Action to process after a delay.
       */
      action: string;
    }> => {
      // https://regex101.com/r/rAAT3a/1
      const regex = getCachedRegExp(
        '^#send\\s+(?<seconds>\\d+)\\s+(?<action>.+)$',
        'g'
      );

      const match = regex.exec(action);

      if (!match?.groups) {
        return;
      }

      return {
        seconds: Number(match.groups.seconds),
        action: match.groups.action,
      };
    };

    /**
     * Send a command to the game.
     */
    const sendCommand = (command: string): void => {
      // Let the world know we are sending a command.
      dispatch('game:command', { command });
      gameInstance.send(command);
    };

    /**
     * Essentially applies the enabled highlights to the text game event.
     */
    const buildStyledTextGameEvent = (
      gameEvent: TextGameEvent
    ): StyledTextGameEvent => {
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
    };
  };
};
