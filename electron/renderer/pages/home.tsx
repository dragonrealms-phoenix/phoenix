import {
  EuiListGroup,
  EuiListGroupItem,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { equalsIgnoreCase } from '../../common/string/equals-ignore-case.js';
import { Grid } from '../components/grid/grid.jsx';
import { useLogger } from '../hooks/logger.jsx';
import { runInBackground } from '../lib/async/run-in-background.js';

interface IpcSgeCharacter {
  gameCode: string;
  accountName: string;
  characterName: string;
}

const HomePage: React.FC = (): ReactNode => {
  const logger = useLogger('page:home');

  const router = useRouter();

  const [characters, setCharacters] = useState<Array<IpcSgeCharacter>>([]);

  const [playingCharacter, setPlayingCharacter] = useState<
    IpcSgeCharacter | undefined
  >();

  const listCharacters = useCallback(async () => {
    setCharacters(await window.api.listCharacters());
  }, []);

  const quitCharacter = useCallback(async () => {
    if (playingCharacter) {
      const characterName = playingCharacter.characterName;
      logger.info('quitting character', { characterName });
      await window.api.quitCharacter();
      setPlayingCharacter(undefined);
    }
  }, [logger, playingCharacter]);

  const onClickQuitCharacter = useCallback(() => {
    runInBackground(async () => {
      await quitCharacter();
    });
  }, [quitCharacter]);

  const saveAccount = useCallback(
    async (options: { accountName: string; accountPassword: string }) => {
      const { accountName } = options;
      logger.info('saving account', { accountName });
      await window.api.saveAccount(options);
      await listCharacters();
    },
    [logger, listCharacters]
  );

  const onClickSaveAccount = useCallback(
    (options: { accountName: string; accountPassword: string }) => {
      runInBackground(async () => {
        await saveAccount(options);
      });
    },
    [saveAccount]
  );

  const removeAccount = useCallback(
    async (options: { accountName: string }) => {
      const { accountName } = options;
      logger.info('removing account', { accountName });
      if (equalsIgnoreCase(playingCharacter?.accountName, accountName)) {
        await quitCharacter();
      }
      await window.api.removeAccount(options);
      await listCharacters();
    },
    [logger, playingCharacter, listCharacters, quitCharacter]
  );

  const onClickRemoveAccount = useCallback(
    (options: { accountName: string }) => {
      runInBackground(async () => {
        await removeAccount(options);
      });
    },
    [removeAccount]
  );

  const saveCharacter = useCallback(
    async (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
      const { characterName } = options;
      logger.info('adding character', { characterName });
      await window.api.saveCharacter(options);
      await listCharacters();
    },
    [logger, listCharacters]
  );

  const onClickSaveCharacter = useCallback(
    (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
      runInBackground(async () => {
        await saveCharacter(options);
      });
    },
    [saveCharacter]
  );

  const removeCharacter = useCallback(
    async (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
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
    },
    [logger, playingCharacter, listCharacters, quitCharacter]
  );

  const onClickRemoveCharacter = useCallback(
    (options: {
      gameCode: string;
      accountName: string;
      characterName: string;
    }) => {
      runInBackground(async () => {
        await removeCharacter(options);
      });
    },
    [removeCharacter]
  );

  const playCharacter = useCallback(
    async (options: {
      accountName: string;
      characterName: string;
      gameCode: string;
    }) => {
      const { accountName, characterName, gameCode } = options;
      logger.info('playing character', { characterName });
      await window.api.playCharacter(options);
      setPlayingCharacter({
        accountName,
        characterName,
        gameCode,
      });
      await router.push('/grid');
    },
    [logger, router]
  );

  const onClickPlayCharacter = useCallback(
    (options: {
      accountName: string;
      characterName: string;
      gameCode: string;
    }) => {
      runInBackground(async () => {
        await playCharacter(options);
      });
    },
    [playCharacter]
  );

  const accountName = '';
  const accountPassword = '';
  const characterName = '';
  const gameCode = '';

  return (
    <div>
      <EuiListGroup>
        <EuiListGroupItem
          label="Save Account"
          onClick={() => {
            onClickSaveAccount({
              accountName,
              accountPassword,
            });
          }}
        />
        <EuiListGroupItem
          label="Remove Account"
          onClick={() => {
            onClickRemoveAccount({
              accountName,
            });
          }}
        />
        <EuiListGroupItem
          label="Save Character"
          onClick={() => {
            onClickSaveCharacter({
              accountName,
              characterName,
              gameCode,
            });
          }}
        />
        <EuiListGroupItem
          label="Remove Character"
          onClick={() => {
            onClickRemoveCharacter({
              accountName,
              characterName,
              gameCode,
            });
          }}
        />
        <EuiListGroupItem
          label="Play Character"
          onClick={() => {
            onClickPlayCharacter({
              accountName,
              characterName,
              gameCode,
            });
          }}
        />
        <EuiListGroupItem
          label="Quit Character"
          onClick={() => {
            onClickQuitCharacter();
          }}
        />
      </EuiListGroup>
      {characters.map((character) => {
        return (
          <EuiPanel key={character.characterName}>
            Game Code: {character.gameCode} <br />
            Account Name: {character.accountName} <br />
            Character Name: {character.characterName}
          </EuiPanel>
        );
      })}
      <EuiSpacer size="l" />
      <div
        style={{
          border: '5px solid pink',
          height: 400,
          width: 400,
        }}
      >
        {/* <Grid

          dimensions={{ height: 390, width: 390 }}
          items={[
            {
              itemId: '1',
              title: 'Title 1',
              content: <div>Content 1</div>,
            },
          ]}
        /> */}
        <Grid boundary={{ height: 390, width: 390 }} />
      </div>
    </div>
  );
};

// nextjs pages must be default exports
export default HomePage;
