import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { Grid } from '../components/grid';

// The grid dynamically modifies the DOM, so we can't use SSR
// because the server and client DOMs will be out of sync.
// https://nextjs.org/docs/messages/react-hydration-error
const GridNoSSR = dynamic(async () => Grid, { ssr: false });

const GridPage: React.FC = (): ReactNode => {
  return <GridNoSSR items={[]} />;
};

export default GridPage;
