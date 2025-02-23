import { EuiPageTemplate } from '@elastic/eui';
import type { ReactNode } from 'react';
import { Sidebar } from './sidebar/sidebar.jsx';
import { ToastList } from './toast/toast-list.jsx';

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
    <EuiPageTemplate
      direction="row"
      paddingSize="s"
      panelled={true}
      grow={true}
      restrictWidth={false}
      responsive={[]}
      css={{ height: '100%', maxWidth: 'unset', display: 'flex' }}
    >
      <EuiPageTemplate.Sidebar
        minWidth={50}
        paddingSize="xs"
        responsive={[]}
        css={{ height: '100vh', position: 'sticky', top: 0 }}
      >
        <Sidebar />
      </EuiPageTemplate.Sidebar>
      <EuiPageTemplate.Section paddingSize="none" grow={true}>
        {children}
        <ToastList />
      </EuiPageTemplate.Section>
    </EuiPageTemplate>
  );
};

Layout.displayName = 'Layout';
