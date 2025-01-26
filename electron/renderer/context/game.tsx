import type { IpcRendererEvent } from 'electron';
import { EuiLoadingSpinner, EuiOverlayMask } from '@elastic/eui';
import { useRouter } from 'next/router.js';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import type {
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
import type { Character } from '../types/game.types.js';

/**
 * React context for storing Game-related data and callbacks.
 */
export interface GameContextValue {
  //
  todo?: true;
}

/**
 * Defines shape and behavior of the context value
 * when no provider is found in the component hierarchy.
 */
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

  const logger = useLogger('renderer:context:game');
  const router = useRouter();
  const pubsub = usePubSub();

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
  useSubscribe(['character:play:starting'], async (character: Character) => {
    logger.debug('character:play:starting', { character });
    setShowPlayStartingOverlay(true);
  });

  useSubscribe(['character:play:started'], async (character: Character) => {
    logger.debug('character:play:started', { character });
    setShowPlayStartingOverlay(false);
    pubsub.publish('sidebar:hide');
    await router.push('/game');
  });

  useSubscribe(['character:play:stopping'], async (character: Character) => {
    logger.debug('character:play:stopping', { character });
    setShowPlayStoppingOverlay(true);
  });

  useSubscribe(['character:play:stopped'], async (character: Character) => {
    logger.debug('character:play:stopped', { character });
    setShowPlayStoppingOverlay(false);
  });

  useSubscribe(
    ['character:play:error'],
    async (event: { title: string; error: Error }) => {
      const { title, error } = event;

      setShowPlayStartingOverlay(false);
      setShowPlayStoppingOverlay(false);

      pubsub.publish('toast:add', {
        title,
        type: 'danger',
        text: error.message,
      });
    }
  );

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
        pubsub.publish('toast:add', {
          title: 'Game Error',
          type: 'danger',
          text: error.message,
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger, pubsub]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:event',
      (_event: IpcRendererEvent, message: GameEventMessage) => {
        const { gameEvent } = message;
        pubsub.publish('game:event', gameEvent);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [pubsub]);

  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:command',
      (_event: IpcRendererEvent, message: GameCommandMessage) => {
        const { command } = message;
        pubsub.publish('game:command', command);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [pubsub]);

  return (
    <GameContext.Provider value={{}}>
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
