import { EuiPageTemplate } from '@elastic/eui';
import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';

export interface LayoutProps {
  /**
   * Nested components.
   */
  children?: ReactNode;
}

export const Layout: React.FC<LayoutProps> = (
  props: LayoutProps
): ReactNode => {
  const { children } = props;

  // In the template, set the `responsive` property to an empty array
  // so that the sidebar always shows on the left. Otherwise, if the
  // window is resized to be too small, the sidebar will stack on top.
  // And that's not the UX we want.

  return (
    <EuiPageTemplate grow={true} responsive={[]}>
      <EuiPageTemplate.Sidebar minWidth={50} paddingSize="xs" responsive={[]}>
        <Sidebar />
      </EuiPageTemplate.Sidebar>
      <EuiPageTemplate.Section paddingSize="none" grow={true}>
        {children}
      </EuiPageTemplate.Section>
    </EuiPageTemplate>
  );
};

Layout.displayName = 'Layout';
