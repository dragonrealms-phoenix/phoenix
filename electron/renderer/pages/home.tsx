import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useLogger } from '../hooks/logger.jsx';

const HomePage: React.FC = (): ReactNode => {
  const logger = useLogger('page:home');

  const router = useRouter();

  return <></>;
};

// nextjs pages must be default exports
export default HomePage;
