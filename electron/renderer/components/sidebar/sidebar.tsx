import { EuiFlexGroup, EuiFlexItem, EuiFlyout } from '@elastic/eui';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { SidebarItemAccounts } from './accounts/sidebar-item-accounts.jsx';
import { SidebarItemCharacters } from './characters/sidebar-item-characters.jsx';
import { SidebarItemHelp } from './help/sidebar-item-help.jsx';
import { SidebarItemSettings } from './settings/sidebar-item-settings.jsx';
import { SidebarItem } from './sidebar-item.jsx';

export const Sidebar: React.FC = (): ReactNode => {
  const [showCharacters, setShowCharacters] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <EuiFlexGroup direction="column" css={{ height: '100%' }}>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup
            direction="column"
            gutterSize="none"
            alignItems="center"
          >
            <EuiFlexItem grow={false}>
              <SidebarItem
                label="Characters"
                iconType="user"
                iconColor="primary"
                iconSize="l"
                onClick={() => setShowCharacters(!showCharacters)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <SidebarItem
                label="Accounts"
                iconType="key"
                iconColor="primary"
                iconSize="l"
                onClick={() => setShowAccounts(!showAccounts)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={true}>{/* empty space in the middle */}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup
            direction="column"
            gutterSize="none"
            alignItems="center"
          >
            <EuiFlexItem grow={false}>
              <SidebarItem
                label="Help"
                iconType="questionInCircle"
                iconColor="text"
                iconSize="xl" // https://github.com/elastic/eui/issues/6322
                popoverContent={<SidebarItemHelp />}
              ></SidebarItem>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <SidebarItem
                label="Settings"
                iconType="gear"
                iconColor="text"
                iconSize="l"
                onClick={() => setShowSettings(!showSettings)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      {showCharacters && (
        <EuiFlyout
          side="left"
          type="overlay"
          paddingSize="s"
          size="s"
          className="eui-yScroll"
          hideCloseButton={true}
          outsideClickCloses={true}
          onClose={() => setShowCharacters(false)}
        >
          <SidebarItemCharacters />
        </EuiFlyout>
      )}

      {showAccounts && (
        <EuiFlyout
          side="left"
          type="overlay"
          paddingSize="s"
          size="s"
          className="eui-yScroll"
          hideCloseButton={true}
          outsideClickCloses={true}
          onClose={() => setShowAccounts(false)}
        >
          <SidebarItemAccounts />
        </EuiFlyout>
      )}

      {showSettings && (
        <EuiFlyout
          side="left"
          type="overlay"
          paddingSize="s"
          size="s"
          className="eui-yScroll"
          hideCloseButton={true}
          outsideClickCloses={true}
          onClose={() => setShowSettings(false)}
        >
          <SidebarItemSettings />
        </EuiFlyout>
      )}
    </>
  );
};

Sidebar.displayName = 'Sidebar';
