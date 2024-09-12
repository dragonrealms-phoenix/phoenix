import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLogger } from '../hooks/logger.jsx';
import { runInBackground } from '../lib/async/run-in-background.js';

const HomePage: React.FC = (): ReactNode => {
  const logger = useLogger('page:home');

  const router = useRouter();

  // TODO make the home page useful
  //      - display list of favorite characters?
  //      - display list of recent characters?

  useEffect(() => {
    runInBackground(async () => {
      await router.push('/grid');
    });
  }, [router]);

  return <></>;
};

// nextjs pages must be default exports
export default HomePage;
