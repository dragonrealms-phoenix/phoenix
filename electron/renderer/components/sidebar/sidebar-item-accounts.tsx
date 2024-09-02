import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiCode,
  EuiConfirmModal,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isBlank } from '../../../common/string/is-blank.js';
import { runInBackground } from '../../lib/async/run-in-background.js';

interface TableRowItem {
  accountName: string;
}

interface FormRecord {
  accountName?: string;
  accountPassword?: string;
}

interface FormErrors {
  accountName?: string;
  accountPassword?: string;
}

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);

  // All the table row items (accounts) to display.
  const [tableRowItems, setTableRowItems] = useState<Array<TableRowItem>>([]);

  // The contextual form record (account) for the current action.
  const [formRecord, setFormRecord] = useState<FormRecord>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateAccountName = useCallback(() => {
    if (isBlank(formRecord.accountName)) {
      setFormErrors({
        ...formErrors,
        accountName: 'Name is required.',
      });
    } else {
      setFormErrors({
        ...formErrors,
        accountName: undefined,
      });
    }
  }, [formRecord, formErrors]);

  const validateAccountPassword = useCallback(() => {
    if (isBlank(formRecord.accountPassword)) {
      setFormErrors({
        ...formErrors,
        accountPassword: 'Password is required.',
      });
    } else {
      setFormErrors({
        ...formErrors,
        accountPassword: undefined,
      });
    }
  }, [formRecord, formErrors]);

  const loadAccounts = useCallback(async () => {
    const accounts = await window.api.listAccounts();
    setTableRowItems(accounts);
  }, []);

  const closeModals = useCallback(() => {
    setShowAddAccountModal(false);
    setShowEditAccountModal(false);
    setShowRemoveAccountModal(false);
    setFormRecord({});
    setFormErrors({});
  }, []);

  const onAddAccountClick = useCallback(() => {
    closeModals();
    setShowAddAccountModal(true);
  }, [closeModals]);

  const onEditAccountClick = useCallback(
    (tableRowItem: TableRowItem) => {
      closeModals();
      setFormRecord(tableRowItem);
      setFormErrors({});
      setShowEditAccountModal(true);
    },
    [closeModals]
  );

  const onRemoveAccountClick = useCallback(
    (tableRowItem: TableRowItem) => {
      closeModals();
      setFormRecord(tableRowItem);
      setFormErrors({});
      setShowRemoveAccountModal(true);
    },
    [closeModals]
  );

  const onAccountSaveConfirm = useCallback(() => {
    runInBackground(async () => {
      validateAccountName();
      validateAccountPassword();
      if (formErrors.accountName || formErrors.accountPassword) {
        return;
      }
      await window.api.saveAccount({
        accountName: formRecord.accountName!,
        accountPassword: formRecord.accountPassword!,
      });
      await loadAccounts();
      closeModals();
    });
  }, [
    formRecord,
    formErrors,
    validateAccountName,
    validateAccountPassword,
    loadAccounts,
    closeModals,
  ]);

  const onAccountRemoveConfirm = useCallback(() => {
    runInBackground(async () => {
      if (isBlank(formRecord.accountName)) {
        return;
      }
      await window.api.removeAccount({
        accountName: formRecord.accountName,
      });
      await loadAccounts();
      closeModals();
    });
  }, [formRecord, loadAccounts, closeModals]);

  const accountAddModal = useMemo(() => {
    return (
      <EuiConfirmModal
        title="Add Account"
        onCancel={closeModals}
        onConfirm={onAccountSaveConfirm}
        cancelButtonText="Cancel"
        confirmButtonText="Save"
        buttonColor="primary"
        defaultFocusedButton="cancel"
      >
        <EuiForm component="form">
          <EuiFormRow
            label="Name"
            isInvalid={!!formErrors.accountName?.length}
            error={formErrors.accountName}
          >
            <EuiFieldText
              name="accountName"
              onChange={(event) => {
                setFormRecord({
                  ...formRecord,
                  accountName: event.target.value,
                });
                validateAccountName();
              }}
              isInvalid={!!formErrors.accountName?.length}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Password"
            isInvalid={!!formErrors.accountPassword?.length}
            error={formErrors.accountPassword}
          >
            <EuiFieldPassword
              name="accountPassword"
              onChange={(event) => {
                setFormRecord({
                  ...formRecord,
                  accountPassword: event.target.value,
                });
                validateAccountPassword();
              }}
              isInvalid={!!formErrors.accountPassword?.length}
              type="dual"
            />
          </EuiFormRow>
        </EuiForm>
      </EuiConfirmModal>
    );
  }, [
    formRecord,
    formErrors,
    validateAccountName,
    validateAccountPassword,
    onAccountSaveConfirm,
    closeModals,
  ]);

  const accountEditModal = useMemo(() => {
    return <>edit</>;
  }, []);

  const accountRemoveModal = useMemo(() => {
    return (
      <EuiConfirmModal
        title={
          <>
            Remove account <EuiCode>{formRecord.accountName}</EuiCode>?
          </>
        }
        onCancel={closeModals}
        onConfirm={onAccountRemoveConfirm}
        cancelButtonText="Cancel"
        confirmButtonText="Remove"
        buttonColor="danger"
        defaultFocusedButton="cancel"
      >
        Associated characters will also be removed.
      </EuiConfirmModal>
    );
  }, [formRecord, onAccountRemoveConfirm, closeModals]);

  useEffect(() => {
    runInBackground(async () => {
      await loadAccounts();
    });
  }, [loadAccounts]);

  const columns: Array<EuiBasicTableColumn<TableRowItem>> = [
    {
      field: 'accountName',
      name: 'Name',
      dataType: 'string',
    },
    {
      field: 'actions',
      name: 'Actions',
      render: (_value: unknown, record: TableRowItem) => {
        return (
          <EuiFlexGroup responsive={true} gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Edit Account" position="bottom">
                <EuiButtonIcon
                  aria-label="Edit Account"
                  iconType="pencil"
                  display="base"
                  color="warning"
                  onClick={() => onEditAccountClick(record)}
                />
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Remove Account" position="bottom">
                <EuiButtonIcon
                  aria-label="Remove Account"
                  iconType="cross"
                  display="base"
                  color="danger"
                  onClick={() => onRemoveAccountClick(record)}
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

      {tableRowItems.length > 0 && (
        <EuiInMemoryTable items={tableRowItems} columns={columns} />
      )}

      <EuiSpacer size="m" />

      {showAddAccountModal && accountAddModal}
      {showEditAccountModal && accountEditModal}
      {showRemoveAccountModal && accountRemoveModal}
    </EuiPanel>
  );
};
