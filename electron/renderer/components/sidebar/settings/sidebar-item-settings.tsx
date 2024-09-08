import { EuiCallOut, EuiPanel, EuiSpacer } from '@elastic/eui';
import type { ReactNode } from 'react';

export const SidebarItemSettings: React.FC = (): ReactNode => {
  return (
    <EuiPanel>
      <EuiCallOut title="Settings" iconType="gear" size="s">
        (todo)
      </EuiCallOut>

      <EuiSpacer size="m" />
    </EuiPanel>
  );
};

SidebarItemSettings.displayName = 'SidebarItemSettings';
