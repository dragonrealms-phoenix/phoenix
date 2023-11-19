import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { runInBackground } from '../../common/async';
import { useLogger } from '../components/logger';

const HomePage: React.FC = (): ReactNode => {
  // --
  const { logger } = useLogger('page:grid');
  useEffect(() => {
    runInBackground(async () => {
      logger.info('>> ping', { response: await window.api.ping() });

      logger.info('>> sgeAddAccount', {
        response: await window.api.sgeAddAccount({
          gameCode: 'DR',
          username: 'test-username',
          password: 'test-password',
        }),
      });

      logger.info('>> sgeRemoveAccount', {
        response: await window.api.sgeRemoveAccount({
          gameCode: 'DR',
          username: 'test-username',
        }),
      });

      logger.info('>> sgeListAccounts', {
        response: await window.api.sgeListAccounts({
          gameCode: 'DR',
        }),
      });

      logger.info('>> sgeListCharacters', {
        response: await window.api.sgeListCharacters({
          gameCode: 'DR',
          username: 'test-username',
        }),
      });

      logger.info('>> gamePlayCharacter', {
        response: await window.api.gamePlayCharacter({
          gameCode: 'DR',
          username: 'test-username',
          characterName: 'test-character',
        }),
      });

      logger.info('>> gameSendCommand', {
        response: await window.api.gameSendCommand('test command'),
      });
    });

    window.api.onMessage('window:pong', (_event, data) => {
      logger.info('<< window:pong', { data });
    });
  }, []);
  // --

  // TODO show welcome page
  //      user to select recent character, or add account, etc
  //      once select a character, then log in and load grid
  return <div>Hello World</div>;
};

export default HomePage;
