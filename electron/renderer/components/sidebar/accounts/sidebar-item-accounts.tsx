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
import type { Account } from '../../../../common/account/types.js';
import { useRemoveAccount, useSaveAccount } from '../../../hooks/accounts.jsx';
import { useShowSidebarCharacters } from '../../../hooks/sidebar.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import type { ModalAddAccountConfirmData } from './modal-add-account.jsx';
import { ModalAddAccount } from './modal-add-account.jsx';
import { ModalEditAccount } from './modal-edit-account.jsx';
import type { ModalRemoveAccountConfirmData } from './modal-remove-account.jsx';
import { ModalRemoveAccount } from './modal-remove-account.jsx';
import { TableListAccounts } from './table-list-accounts.jsx';

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);

  // Hooks to manage accounts.
  const saveAccount = useSaveAccount();
  const removeAccount = useRemoveAccount();

  // The contextual account being managed.
  const [account, setAccount] = useState<Account>();

  const showSidebarCharacters = useShowSidebarCharacters();

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRemoveModal(false);
  }, []);

  const onAddAccountClick = useCallback(() => {
    closeModals();
    setAccount(undefined);
    setShowAddModal(true);
  }, [closeModals]);

  const onEditAccountClick = useCallback(
    (account: Account) => {
      closeModals();
      setAccount(account);
      setShowEditModal(true);
    },
    [closeModals]
  );

  const onRemoveAccountClick = useCallback(
    (account: Account) => {
      closeModals();
      setAccount(account);
      setShowRemoveModal(true);
    },
    [closeModals]
  );

  const onAccountSaveConfirm = useCallback(
    (data: ModalAddAccountConfirmData) => {
      runInBackground(async () => {
        await saveAccount({
          accountName: data.accountName,
          accountPassword: data.accountPassword,
        });
      });
      closeModals();
      setAccount(undefined);
    },
    [closeModals, saveAccount]
  );

  const onAccountRemoveConfirm = useCallback(
    (data: ModalRemoveAccountConfirmData) => {
      runInBackground(async () => {
        await removeAccount({
          accountName: data.accountName,
        });
      });
      closeModals();
      setAccount(undefined);
    },
    [closeModals, removeAccount]
  );

  return (
    <EuiPanel paddingSize="none">
      <EuiCallOut title="My Accounts" iconType="key" size="s">
        Add your DragonRealms accounts here, then use the{' '}
        <EuiLink onClick={showSidebarCharacters}>Characters menu</EuiLink> to
        add and play your characters.
      </EuiCallOut>

      <EuiPanel paddingSize="s" hasShadow={false}>
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
    </EuiPanel>
  );
};

SidebarItemAccounts.displayName = 'SidebarItemAccounts';
