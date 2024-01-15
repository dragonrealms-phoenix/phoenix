import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { useLogger } from '../hooks/logger';

export interface GameContextValue {
  /**
   * Name of the play.net account of the character being played.
   */
  accountName: string;
  /**
   * Name of the character being played.
   */
  characterName: string;
  /**
   * Code of the game instance being played.
   * For example, "DR" for DragonRealms.
   */
  gameCode: string;
  /**
   * Is the player connected to the game?
   * More precisely, have we received the `game:connect` event.
   * When both `isConnected` and `isDisconnected` are false then
   * the player has never attempted to connect.
   */
  isConnected: boolean;
  /**
   * Is the player disconnected from the game?
   * More precisely, have we received the `game:disconnect` event.
   * When both `isConnected` and `isDisconnected` are false then
   * the player has never attempted to connect.
   */
  isDisconnected: boolean;
}

export const GameContext = createContext<GameContextValue>({
  accountName: '',
  characterName: '',
  gameCode: '',
  isConnected: false,
  isDisconnected: false,
});

export interface GameProviderProps {
  children?: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = (
  props: GameProviderProps
) => {
  const { children } = props;

  const { logger } = useLogger('context:game');

  const [accountName, setAccountName] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [gameCode, setInstanceCode] = useState<string>('');

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(false);

  useEffect(() => {
    window.api.onMessage(
      'game:connect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:connect', {
          accountName,
          characterName,
          gameCode,
        });
        setAccountName(accountName);
        setCharacterName(characterName);
        setInstanceCode(gameCode);
        setIsConnected(true);
        setIsDisconnected(false);
      }
    );

    return () => {
      window.api.removeAllListeners('game:connect');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage(
      'game:disconnect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:disconnect', {
          accountName,
          characterName,
          gameCode,
        });
        setAccountName(accountName);
        setCharacterName(characterName);
        setInstanceCode(gameCode);
        setIsConnected(false);
        setIsDisconnected(true);
      }
    );

    return () => {
      window.api.removeAllListeners('game:disconnect');
    };
  }, [logger]);

  return (
    <GameContext.Provider
      value={{
        accountName,
        characterName,
        gameCode,
        isConnected,
        isDisconnected,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
