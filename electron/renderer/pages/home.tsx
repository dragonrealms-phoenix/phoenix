import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLogger } from '../hooks/logger.jsx';

const HomePage: React.FC = (): ReactNode => {
  const logger = useLogger('page:home');

  // TODO make the home page useful
  //      - display list of favorite characters?
  //      - display list of recent characters?
  useEffect(() => {
    logger.info('page loaded');
  }, [logger]);

  return <></>;
};

// nextjs pages must be default exports
export default HomePage;
