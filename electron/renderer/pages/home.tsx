import { type ReactNode, useCallback, useState } from 'react';
import { runInBackground } from '../../common/async';
import { equalsIgnoreCase } from '../../common/string';
import { useLogger } from '../components/logger';

interface IpcSgeCharacter {
  gameCode: string;
  accountName: string;
  characterName: string;
}

const HomePage: React.FC = (): ReactNode => {
  const { logger } = useLogger('page:home');

  // TODO add state to track when any of the callbacks are running
  //      so that we show a loading indicator or overlay or something
  //      to prevent the user issuing more commands concurrently

  const [characters, setCharacters] = useState<Array<IpcSgeCharacter>>([]);

  const [playingCharacter, setPlayingCharacter] = useState<
    IpcSgeCharacter | undefined
  >();

  const listCharacters = useCallback(async () => {
    setCharacters(await window.api.listCharacters());
  }, []);

  const saveAccount = useCallback(
    (options: { accountName: string; accountPassword: string }) => {
      runInBackground(async () => {
        const { accountName } = options;
        logger.info('saving account', { accountName });
        await window.api.saveAccount(options);
        await listCharacters();
      });
    },
    []
  );

  const removeAccount = useCallback((options: { accountName: string }) => {
    runInBackground(async () => {
      const { accountName } = options;
      logger.info('removing account', { accountName });
      if (equalsIgnoreCase(playingCharacter?.accountName, accountName)) {
        await quitCharacter();
      }
      await window.api.removeAccount(options);
      await listCharacters();
    });
  }, []);

  const addCharacter = useCallback(
    (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
      runInBackground(async () => {
        const { characterName } = options;
        logger.info('saving character', { characterName });
        await window.api.saveCharacter(options);
        await listCharacters();
      });
    },
    []
  );

  const removeCharacter = useCallback(
    (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
      runInBackground(async () => {
        const { gameCode, accountName, characterName } = options;
        logger.info('removing character', { characterName });
        if (
          equalsIgnoreCase(playingCharacter?.gameCode, gameCode) &&
          equalsIgnoreCase(playingCharacter?.accountName, accountName) &&
          equalsIgnoreCase(playingCharacter?.characterName, characterName)
        ) {
          await quitCharacter();
        }
        await window.api.removeCharacter(options);
        await listCharacters();
      });
    },
    []
  );

  const playCharacter = useCallback(
    (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
      runInBackground(async () => {
        const { gameCode, accountName, characterName } = options;
        logger.info('playing character', { characterName });
        await window.api.playCharacter(options);
        setPlayingCharacter({
          gameCode,
          accountName,
          characterName,
        });
      });
    },
    []
  );

  const quitCharacter = useCallback(async () => {
    if (playingCharacter) {
      const characterName = playingCharacter.characterName;
      logger.info('quitting character', { characterName });
      await window.api.sendCommand('quit');
      setPlayingCharacter(undefined);
    }
  }, []);

  return (
    <div>
      <h2>Characters</h2>
      <div>
        <button
          onClick={() => {
            saveAccount({
              accountName: 'test',
              accountPassword: 'test',
            });
          }}
        >
          Save Account
        </button>
        <button
          onClick={() => {
            addCharacter({
              gameCode: 'DR',
              accountName: 'test',
              characterName: 'test',
            });
          }}
        >
          Add Character
        </button>
      </div>
      {characters.map((character) => {
        return (
          <div key={character.characterName}>
            Game Code: {character.gameCode} <br />
            Account Name: {character.accountName} <br />
            Character Name: {character.characterName}
          </div>
        );
      })}
    </div>
  );
};

export default HomePage;
