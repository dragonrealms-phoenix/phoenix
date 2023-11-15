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
      logger.info('>> sgeListCharacters', {});
    });
  }, []);
  // --

  // TODO show welcome page
  //      user to select recent character, or add account, etc
  //      once select a character, then log in and load grid
  return <div>Hello World</div>;
};

export default HomePage;
