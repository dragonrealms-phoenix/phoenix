import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useListAccounts } from '../../../hooks/list-accounts.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import type { Account } from '../../../types/game.types.js';
import type { ModalAddAccountConfirmData } from './modal-add-account.jsx';
import { ModalAddAccount } from './modal-add-account.jsx';
import { ModalEditAccount } from './modal-edit-account.jsx';
import type { ModalRemoveAccountConfirmData } from './modal-remove-account.jsx';
import { ModalRemoveAccount } from './modal-remove-account.jsx';

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);

  console.log('*** rendering sidebar');

  // All accounts to display.
  const accounts = useListAccounts();

  // The contextual account being edited or removed.
  const [account, setAccount] = useState<Account>();

  const closeModals = useCallback(() => {
    setShowAddAccountModal(false);
    setShowEditAccountModal(false);
    setShowRemoveAccountModal(false);
    setAccount(undefined);
  }, []);

  const onAddAccountClick = useCallback(() => {
    closeModals();
    setShowAddAccountModal(true);
  }, [closeModals]);

  const onEditAccountClick = useCallback(
    (account: Account) => {
      closeModals();
      setAccount(account);
      setShowEditAccountModal(true);
    },
    [setAccount, closeModals]
  );

  const onRemoveAccountClick = useCallback(
    (account: Account) => {
      closeModals();
      setAccount(account);
      setShowRemoveAccountModal(true);
    },
    [setAccount, closeModals]
  );

  const onAccountSaveConfirm = useCallback(
    (data: ModalAddAccountConfirmData) => {
      closeModals();
      runInBackground(async () => {
        await window.api.saveAccount({
          accountName: data.accountName,
          accountPassword: data.accountPassword,
        });
      });
    },
    [closeModals]
  );

  const onAccountRemoveConfirm = useCallback(
    (data: ModalRemoveAccountConfirmData) => {
      closeModals();
      runInBackground(async () => {
        await window.api.removeAccount({
          accountName: data.accountName,
        });
      });
    },
    [closeModals]
  );

  const columns: Array<EuiBasicTableColumn<Account>> = [
    {
      field: 'accountName',
      name: 'Name',
      dataType: 'string',
    },
    {
      field: 'actions',
      name: 'Actions',
      render: (_value: unknown, account: Account) => {
        return (
          <EuiFlexGroup responsive={true} gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Change Password" position="bottom">
                <EuiButtonIcon
                  aria-label="Change Password"
                  iconType="lock"
                  // display="base"
                  color="warning"
                  onClick={() => onEditAccountClick(account)}
                />
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Log Out" position="bottom">
                <EuiButtonIcon
                  aria-label="Log Out"
                  iconType="exit"
                  // display="base"
                  color="danger"
                  onClick={() => onRemoveAccountClick(account)}
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        );
      },
    },
  ];

  return (
    <EuiPanel>
      <EuiCallOut title="My Accounts" iconType="key" size="s">
        Securely add your DragonRealms accounts, then use the Characters menu to
        add and play your characters.
      </EuiCallOut>

      <EuiSpacer size="m" />

      <EuiButton size="s" onClick={() => onAddAccountClick()}>
        Add Account
      </EuiButton>

      <EuiSpacer size="m" />

      {accounts.length > 0 && (
        <EuiInMemoryTable items={accounts} columns={columns} />
      )}

      <EuiSpacer size="m" />

      {showAddAccountModal && (
        <ModalAddAccount
          onClose={closeModals}
          onConfirm={onAccountSaveConfirm}
        />
      )}

      {showEditAccountModal && account && (
        <ModalEditAccount
          initialData={account}
          onClose={closeModals}
          onConfirm={onAccountSaveConfirm}
        />
      )}

      {showRemoveAccountModal && account && (
        <ModalRemoveAccount
          initialData={account}
          onClose={closeModals}
          onConfirm={onAccountRemoveConfirm}
        />
      )}
    </EuiPanel>
  );
};

SidebarItemAccounts.displayName = 'SidebarItemAccounts';
