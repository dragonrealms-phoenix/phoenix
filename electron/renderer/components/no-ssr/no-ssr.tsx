import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/**
 * Force a component to not be rendered on the server.
 *
 * In JSX, to differentiate the generic `<P>` from an HTML tag
 * then we append a trailing comma as `<P,>`.
 */
export const NoSSR = <P,>(
  component: React.FC<P> | ReactNode
): React.ComponentType<P> => {
  if (typeof component === 'function') {
    return dynamic(async () => component, { ssr: false });
  }
  return NoSSR(() => component);
};

/**
 * Convenience component to wrap a block of components that should not be
 * rendered on the server. SSR may have value, but unless every component
 * is designed to be SSR compatible then it's more pain than it's worth.
 *
 * Usage:
 *  <NoSSRBoundary>
 *    ... components that can safely use `window` and browser objects ...
 *  </NoSSRBoundary>
 */
export const NoSSRBoundary = NoSSR((props: { children?: ReactNode }) => {
  return <>{props.children}</>;
});

NoSSRBoundary.displayName = 'NoSSRBoundary';
