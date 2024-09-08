import type { IpcRendererEvent } from 'electron';
import type { ReactNode } from 'react';
import { createContext, useEffect } from 'react';
import type {
  GameConnectMessage,
  GameDisconnectMessage,
  GameErrorMessage,
} from '../../common/game/types.js';
import { useQuitCharacter } from '../hooks/characters.jsx';
import { useLogger } from '../hooks/logger.jsx';
import { runInBackground } from '../lib/async/run-in-background.js';

/**
 * React context for storing Game-related data and callbacks.
 */
export interface GameContextValue {
  //
}

export const GameContext = createContext<GameContextValue>({});

GameContext.displayName = 'GameContext';

export interface GameProviderProps {
  /**
   * Nested components.
   */
  children?: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = (
  props: GameProviderProps
) => {
  const { children } = props;

  const logger = useLogger('context:game');

  const quitCharacter = useQuitCharacter();

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:connect',
      (_event: IpcRendererEvent, message: GameConnectMessage) => {
        const { accountName, characterName, gameCode } = message;
        logger.debug('game:connect', {
          accountName,
          characterName,
          gameCode,
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:disconnect',
      (_event: IpcRendererEvent, message: GameDisconnectMessage) => {
        const { accountName, characterName, gameCode } = message;
        logger.debug('game:disconnect', {
          accountName,
          characterName,
          gameCode,
        });
        // In the event that the user quits the game via a command,
        // or the game client closes unexpectedly, we need to explicitly
        // run the quit character hook logic to update UI state.
        runInBackground(async () => {
          await quitCharacter();
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger, quitCharacter]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:error',
      (_event: IpcRendererEvent, message: GameErrorMessage) => {
        const { error } = message;
        logger.error('game:error', { error });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger]);

  return <GameContext.Provider value={{}}>{children}</GameContext.Provider>;
};
