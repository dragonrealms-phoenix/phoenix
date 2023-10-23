import Link from 'next/link';
import { Grid } from '../components/grid/grid';
import { useLogger } from '../components/logger';

const DragDropPage: React.FC = (): JSX.Element => {
  const { logger } = useLogger('page:dnd');

  logger.info('rendering');

  return (
    <>
      <p>
        <Link href="/">Go home</Link>
      </p>
      <Grid />
    </>
  );
};

export default DragDropPage;
