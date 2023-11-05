import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { runInBackground } from '../../common/async/async.utils';
import { useLogger } from '../components/logger';

const HomePage: React.FC = (): ReactNode => {
  // --
  const { logger } = useLogger('page:grid');
  useEffect(() => {
    runInBackground(async () => {
      logger.info('>> ping', { response: await window.api.ping() });
      logger.info('>> speak', { response: await window.api.speak('electron') });
      logger.info('>> climb', {
        response: await window.api.climb({ height: 2 }),
      });
    });
  }, []);
  // --

  // TODO show welcome page
  //      user to select recent character, or add account, etc
  //      once select a character, then log in and load grid
  return <div>Hello World</div>;
};

export default HomePage;
