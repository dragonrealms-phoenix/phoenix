import {
  EuiButton,
  EuiCallOut,
  EuiLink,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useRemoveAccount, useSaveAccount } from '../../../hooks/accounts.jsx';
import { usePubSub } from '../../../hooks/pubsub.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import type { Account } from '../../../types/game.types.js';
import { SidebarId } from '../../../types/sidebar.types.js';
import type { ModalAddAccountConfirmData } from './modal-add-account.jsx';
import { ModalAddAccount } from './modal-add-account.jsx';
import { ModalEditAccount } from './modal-edit-account.jsx';
import type { ModalRemoveAccountConfirmData } from './modal-remove-account.jsx';
import { ModalRemoveAccount } from './modal-remove-account.jsx';
import { TableListAccounts } from './table-list-accounts.jsx';

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  const { publish } = usePubSub();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Hooks to manage accounts.
  const saveAccount = useSaveAccount();
  const removeAccount = useRemoveAccount();

  // The contextual account being managed.
  const [account, setAccount] = useState<Account>();

  const switchToSidebarCharacters = useCallback(() => {
    publish('sidebar:show', SidebarId.Characters);
  }, [publish]);

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRemoveModal(false);
    setAccount(undefined);
  }, []);

  const onAddAccountClick = useCallback(() => {
    closeModals();
    setShowAddModal(true);
  }, [closeModals]);

  const onEditAccountClick = useCallback(
    (account: Account) => {
      closeModals();
      setAccount(account);
      setShowEditModal(true);
    },
    [setAccount, closeModals]
  );

  const onRemoveAccountClick = useCallback(
    (account: Account) => {
      closeModals();
      setAccount(account);
      setShowRemoveModal(true);
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
        Add your DragonRealms accounts here, then use the{' '}
        <EuiLink onClick={switchToSidebarCharacters}>Characters menu</EuiLink>{' '}
        to add and play your characters.
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

      {showAddModal && (
        <ModalAddAccount
          onClose={closeModals}
          onConfirm={onAccountSaveConfirm}
        />
      )}

      {showEditModal && account && (
        <ModalEditAccount
          initialData={account}
          onClose={closeModals}
          onConfirm={onAccountSaveConfirm}
        />
      )}

      {showRemoveModal && account && (
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
