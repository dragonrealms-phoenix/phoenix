import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/**
 * Force a component to not be rendered on the server.
 *
 * In JSX, to differentiate the generic `<P>` from an HTML tag
 * then we append a trailing comma as `<P,>`.
 */
const NoSSR = <P,>(
  component: React.FC<P> | ReactNode
): React.ComponentType<P> => {
  if (typeof component === 'function') {
    return dynamic(async () => component, { ssr: false });
  }
  return NoSSR(() => component);
};

export { NoSSR };
