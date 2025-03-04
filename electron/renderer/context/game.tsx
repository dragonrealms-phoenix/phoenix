import { EuiLoadingSpinner, EuiOverlayMask } from '@elastic/eui';
import type { ReactNode } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';
import type { Character } from '../../common/account/types.js';
import type {
  GameCode,
  GameCommandMessage,
  GameConnectMessage,
  GameDisconnectMessage,
  GameErrorMessage,
  GameEventMessage,
} from '../../common/game/types.js';
import { useQuitCharacter } from '../hooks/characters.jsx';
import { useLogger } from '../hooks/logger.jsx';
import { usePubSub, useSubscribe } from '../hooks/pubsub.jsx';
import { runInBackground } from '../lib/async/run-in-background.js';

/**
 * React context for storing Game-related data and callbacks.
 */
export interface GameContextValue {
  /**
   * Whether the game client is connected.
   */
  isConnected: boolean;
  /**
   * The account of the connected character.
   */
  accountName?: string;
  /**
   * The name of the connected character.
   */
  characterName?: string;
  /**
   * The game code of the connected character.
   */
  gameCode?: GameCode;
}

/**
 * Defines shape and behavior of the context value
 * when no provider is found in the component hierarchy.
 */
export const GameContext = createContext<GameContextValue>({
  isConnected: false,
});

GameContext.displayName = 'GameContext';

export interface GameProviderProps {
  /**
   * Nested components.
   */
  children?: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = (
  props: GameProviderProps
): ReactNode => {
  const { children } = props;

  const logger = useLogger('renderer:context:game');
  const { publish } = usePubSub();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountName, setAccountName] = useState<string>();
  const [characterName, setCharacterName] = useState<string>();
  const [gameCode, setGameCode] = useState<GameCode>();

  const contextValue = useMemo<GameContextValue>(() => {
    return {
      isConnected,
      accountName,
      characterName,
      gameCode,
    };
  }, [isConnected, accountName, characterName, gameCode]);

  const quitCharacter = useQuitCharacter();

  // To protect against a user pressing play/stop while the app
  // is transitioning between characters, show a loading spinner.
  const [showPlayStartingOverlay, setShowPlayStartingOverlay] =
    useState<boolean>(false);

  const [showPlayStoppingOverlay, setShowPlayStoppingOverlay] =
    useState<boolean>(false);

  // You may be lured into subscribing to multiple events
  // to set a single overlay state as true/false, but don't do that.
  // The start/stop events fire back-to-back when you play
  // a second character and one is already playing. What you see
  // is a quick flicker of the overlay then no overlay at all.
  // Instead, use two variables to drive the overlay.
  useSubscribe('character:play:starting', async (character: Character) => {
    logger.debug('character:play:starting', { character });
    setShowPlayStartingOverlay(true);
  });

  useSubscribe('character:play:started', async (character: Character) => {
    logger.debug('character:play:started', { character });
    setShowPlayStartingOverlay(false);
    publish('sidebar:hide');
  });

  useSubscribe('character:play:stopping', async (character: Character) => {
    logger.debug('character:play:stopping', { character });
    setShowPlayStoppingOverlay(true);
  });

  useSubscribe('character:play:stopped', async (character: Character) => {
    logger.debug('character:play:stopped', { character });
    setShowPlayStoppingOverlay(false);
  });

  useSubscribe('game:error', (error: Error) => {
    logger.error('game:error', { error });
    setShowPlayStartingOverlay(false);
    setShowPlayStoppingOverlay(false);
    publish('toast:add', {
      title: 'Game Error',
      type: 'danger',
      text: error.message,
    });
  });

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:connect',
      (message: GameConnectMessage) => {
        const { accountName, characterName, gameCode } = message;
        logger.debug('game:connect', {
          accountName,
          characterName,
          gameCode,
        });
        setIsConnected(true);
        setAccountName(accountName);
        setCharacterName(characterName);
        setGameCode(gameCode);
        publish('game:connect', {
          accountName,
          characterName,
          gameCode,
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger, publish]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:disconnect',
      (message: GameDisconnectMessage) => {
        const { accountName, characterName, gameCode } = message;
        logger.debug('game:disconnect', {
          accountName,
          characterName,
          gameCode,
        });
        setIsConnected(false);
        setAccountName(accountName);
        setCharacterName(characterName);
        setGameCode(gameCode);
        publish('game:disconnect', {
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
  }, [logger, publish, quitCharacter]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:error',
      (message: GameErrorMessage) => {
        const { error } = message;
        publish('game:error', error);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger, publish]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:event',
      (message: GameEventMessage) => {
        const { gameEvent } = message;
        publish('game:event', gameEvent);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [publish]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:command',
      (message: GameCommandMessage) => {
        const { command } = message;
        publish('game:command', command);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [publish]);

  return (
    <GameContext.Provider value={contextValue}>
      <>
        {(showPlayStartingOverlay || showPlayStoppingOverlay) && (
          <EuiOverlayMask>
            <EuiLoadingSpinner size="l" />
          </EuiOverlayMask>
        )}
        {children}
      </>
    </GameContext.Provider>
  );
};
