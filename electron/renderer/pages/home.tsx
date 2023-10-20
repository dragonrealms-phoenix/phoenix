import { EuiIcon, EuiSpacer, EuiText } from '@elastic/eui';
import Link from 'next/link';
import { useLogger } from '../components/logger';

const HomePage: React.FC = (): JSX.Element => {
  const { logger } = useLogger('page:home');

  const onSayHiClick = () => {
    logger.info('saying hello ');
    alert('hi');
  };

  return (
    <div>
      <h1>Hello Next.js 👋</h1>

      <EuiSpacer size="xxl" />

      <button onClick={onSayHiClick}>Say hi to electron</button>

      <p>
        <Link href="/about">About</Link>
      </p>

      <p>
        <Link href="/dnd">Drag-n-Drop</Link>
      </p>

      <p>
        <Link href="http://play.net/dr">DragonRealms</Link>
      </p>

      <EuiText>
        <p>Hello World!</p>
      </EuiText>

      <EuiIcon type="apps" size="l" />
    </div>
  );
};

export default HomePage;
