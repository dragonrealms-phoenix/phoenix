import { EuiFlexGroup, EuiFlexItem, EuiFlyout } from '@elastic/eui';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import { SidebarId } from '../../types/sidebar.types.js';
import { SidebarItemAccounts } from './accounts/sidebar-item-accounts.jsx';
import { SidebarItemCharacters } from './characters/sidebar-item-characters.jsx';
import { SidebarItemHelp } from './help/sidebar-item-help.jsx';
import { SidebarItemSettings } from './settings/sidebar-item-settings.jsx';
import { SidebarItem } from './sidebar-item.jsx';

export const Sidebar: React.FC = (): ReactNode => {
  const [showCharacters, setShowCharacters] = useState<boolean>(false);
  const [showAccounts, setShowAccounts] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const closeSidebar = useCallback(() => {
    setShowCharacters(false);
    setShowAccounts(false);
    setShowSettings(false);
  }, []);

  useSubscribe('sidebar:show', (sidebarId: SidebarId) => {
    closeSidebar();
    switch (sidebarId) {
      case SidebarId.Characters:
        setShowCharacters(true);
        break;
      case SidebarId.Accounts:
        setShowAccounts(true);
        break;
      case SidebarId.Settings:
        setShowSettings(true);
        break;
    }
  });

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
          pushAnimation={true}
          hideCloseButton={false}
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
          pushAnimation={true}
          hideCloseButton={false}
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
          pushAnimation={true}
          hideCloseButton={false}
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
