import { EuiButton, EuiCallOut, EuiPanel, EuiSpacer } from '@elastic/eui';
import type { ReactNode } from 'react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useRemoveAccount, useSaveAccount } from '../../../hooks/accounts.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import type { Account } from '../../../types/game.types.js';
import type { ModalAddAccountConfirmData } from './modal-add-account.jsx';
import { ModalAddAccount } from './modal-add-account.jsx';
import { ModalEditAccount } from './modal-edit-account.jsx';
import type { ModalRemoveAccountConfirmData } from './modal-remove-account.jsx';
import { ModalRemoveAccount } from './modal-remove-account.jsx';
import { TableListAccounts } from './table-list-accounts.jsx';

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);

  // Hooks to save and remove accounts.
  const saveAccount = useSaveAccount();
  const removeAccount = useRemoveAccount();

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
        await saveAccount({
          accountName: data.accountName,
          accountPassword: data.accountPassword,
        });
      });
    },
    [closeModals, saveAccount]
  );

  const onAccountRemoveConfirm = useCallback(
    (data: ModalRemoveAccountConfirmData) => {
      closeModals();
      runInBackground(async () => {
        await removeAccount({
          accountName: data.accountName,
        });
      });
    },
    [closeModals, removeAccount]
  );

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

      <TableListAccounts
        onEditAccountClick={onEditAccountClick}
        onRemoveAccountClick={onRemoveAccountClick}
      />

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
