import type { BrowserWindow } from 'electron';
import * as rxjs from 'rxjs';
import type {
  GameEvent,
  StyledTextGameEvent,
} from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import type { AccountService } from '../../account/types.js';
import { Game } from '../../game/game.instance.js';
import { startLichProcess } from '../../lich/start-process.js';
import { Preferences } from '../../preference/preference.instance.js';
import { PreferenceKey } from '../../preference/types.js';
import { applyHighlights } from '../../setting/highlight/highlight.utils.js';
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
          // TODO substitutions
          // TODO ignores
          // TODO triggers
          // TODO highlights
          // TODO emit as StyledTextGameEvent
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
  };
};
