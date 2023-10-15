import { EuiResizableContainer, EuiText } from '@elastic/eui';
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
      <EuiResizableContainer style={{ height: '200px' }}>
        {(EuiResizablePanel, EuiResizableButton) => (
          <>
            <EuiResizablePanel initialSize={50} minSize="200px" tabIndex={0}>
              <EuiText>Quisquam blanditiis nulla</EuiText>
            </EuiResizablePanel>

            <EuiResizableButton />

            <EuiResizablePanel initialSize={50} minSize="200px" tabIndex={0}>
              <EuiText>
                Molestias amet iste sint libero illo sunt repellat rerum
                exercitationem.
              </EuiText>
            </EuiResizablePanel>
          </>
        )}
      </EuiResizableContainer>
    </div>
  );
};

export default AboutPage;
