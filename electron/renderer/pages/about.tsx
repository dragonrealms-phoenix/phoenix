import Link from 'next/link';
import { useEffect } from 'react';
import { useLogger } from '../components/logger';

const AboutPage: React.FC = (): JSX.Element => {
  const { logger } = useLogger('page:about');

  useEffect(() => {
    window.api.ping().then((response): void => {
      logger.info(response); // pong
    });
  }, []);

  return (
    <div>
      <h1>About</h1>
      <p>This is the about page</p>
      <p>
        <Link href="/">Go home</Link>
      </p>
    </div>
  );
};

export default AboutPage;
