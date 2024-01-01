import { EuiListGroup, EuiListGroupItem, EuiPanel } from '@elastic/eui';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import { runInBackground, sleep } from '../../common/async';
import { equalsIgnoreCase } from '../../common/string';
import { useLogger } from '../components/logger';

interface IpcSgeCharacter {
  gameCode: string;
  accountName: string;
  characterName: string;
}

// I started tracking this via `useState` but when calling it's setter
// the value did not update fast enough before a text game event
// was received, resulting in text routing to the wrong stream window.
let gameStreamId = '';

const HomePage: React.FC = (): ReactNode => {
  const { logger } = useLogger('page:home');

  // TODO for each runInBackground, need to catch and display errors

  // TODO add state to track when any of the callbacks are running
  //      so that we show a loading indicator or overlay or something
  //      to prevent the user issuing more commands concurrently

  const gameEventsSubject$ = useObservable(() => {
    return new rxjs.Subject<{ type: string } & Record<string, any>>();
  });

  useSubscription(gameEventsSubject$, (gameEvent) => {
    switch (gameEvent.type) {
      case 'TEXT':
        appendGameText(`[${gameStreamId}] ${gameEvent.text}`);
        break;
      case 'POP_STREAM':
        gameStreamId = '';
        break;
      case 'PUSH_STREAM':
        gameStreamId = gameEvent.streamId;
        break;
    }
  });

  const [gameText, setGameText] = useState<Array<string>>([]);

  const appendGameText = useCallback((newText: string) => {
    // TODO get user's scrollback buffer preference
    const scrollbackBuffer = 500; // max number of most recent lines to keep
    newText = newText.replace(/\n/g, '<br/>');
    setGameText((texts) => texts.concat(newText).slice(scrollbackBuffer * -1));
  }, []);

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
      await window.api.sendCommand('quit');
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
      //--
      await sleep(2000);
      await window.api.sendCommand('health');
      await sleep(1000);
      await window.api.sendCommand('info');
      await sleep(1000);
      await window.api.sendCommand('experience');
      await sleep(1000);
      await window.api.sendCommand('out');
      await sleep(1000);
      await window.api.sendCommand('out');
      await sleep(1000);
      await window.api.sendCommand('perceive');
      await sleep(10_000);
      await window.api.sendCommand('spell');
      await sleep(1000);
      await window.api.sendCommand('go bank');
      await sleep(1000);
      await window.api.sendCommand('go window');
      //--
    },
    [logger]
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

  useEffect(() => {
    window.api.onMessage(
      'game:connect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:connect', { accountName, characterName, gameCode });
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
      }
    );

    return () => {
      window.api.removeAllListeners('game:disconnect');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage('game:error', (_event, error: Error) => {
      logger.error('game:error', { error });
    });

    return () => {
      window.api.removeAllListeners('game:error');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage('game:event', (_event, gameEvent) => {
      logger.info('game:event', { gameEvent });
      gameEventsSubject$.next(gameEvent);
    });

    return () => {
      window.api.removeAllListeners('game:event');
    };
  }, [logger, gameEventsSubject$]);

  // TODO don't scroll to bottom if user has scrolled up
  // https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react
  const scrollBottomRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView();
    }
  }, [gameText]);

  const accountName = 'xxx';
  const accountPassword = 'xxx';
  const characterName = 'xxx';
  const gameCode = 'xxx';

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
      {gameText.map((text, index) => {
        return (
          <span key={index} style={{ fontFamily: 'Verdana' }}>
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </span>
        );
      })}
      <span ref={scrollBottomRef} />
    </div>
  );
};

export default HomePage;
