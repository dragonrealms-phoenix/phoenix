import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
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
import { Controller, useForm } from 'react-hook-form';
import { isBlank } from '../../../common/string/is-blank.js';
import { runInBackground } from '../../lib/async/run-in-background.js';

interface TableRowItem {
  accountName: string;
}

interface FormRecord {
  accountName?: string;
  accountPassword?: string;
}

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);

  const [tableRowItems, setTableRowItems] = useState<Array<TableRowItem>>([]);
  const [tableRowItem, setTableRowItem] = useState<TableRowItem>();

  const { handleSubmit, control, reset } = useForm<FormRecord>();

  const loadAccounts = useCallback(async () => {
    const accounts = await window.api.listAccounts();
    setTableRowItems(accounts);
  }, []);

  const closeModals = useCallback(() => {
    setShowAddAccountModal(false);
    setShowEditAccountModal(false);
    setShowRemoveAccountModal(false);
    setTableRowItem(undefined);
    reset({});
  }, [reset]);

  const onAddAccountClick = useCallback(() => {
    closeModals();
    setShowAddAccountModal(true);
  }, [closeModals]);

  const onEditAccountClick = useCallback(
    (tableRowItem: TableRowItem) => {
      closeModals();
      setTableRowItem(tableRowItem);
      reset(tableRowItem);
      setShowEditAccountModal(true);
    },
    [setTableRowItem, reset, closeModals]
  );

  const onRemoveAccountClick = useCallback(
    (tableRowItem: TableRowItem) => {
      closeModals();
      setTableRowItem(tableRowItem);
      reset(tableRowItem);
      setShowRemoveAccountModal(true);
    },
    [setTableRowItem, reset, closeModals]
  );

  const onAccountSaveConfirm = useCallback(() => {
    runInBackground(async () => {
      await handleSubmit(async (data: FormRecord) => {
        await window.api.saveAccount({
          accountName: data.accountName!,
          accountPassword: data.accountPassword!,
        });
        await loadAccounts();
        closeModals();
      })();
    });
  }, [handleSubmit, loadAccounts, closeModals]);

  const onAccountRemoveConfirm = useCallback(() => {
    runInBackground(async () => {
      if (isBlank(tableRowItem?.accountName)) {
        return;
      }
      await window.api.removeAccount({
        accountName: tableRowItem.accountName,
      });
      await loadAccounts();
      closeModals();
    });
  }, [tableRowItem, loadAccounts, closeModals]);

  const accountAddModal = useMemo(() => {
    return (
      <EuiConfirmModal
        title="Add Account"
        onCancel={closeModals}
        onConfirm={onAccountSaveConfirm}
        cancelButtonText="Cancel"
        confirmButtonText="Save"
        buttonColor="primary"
      >
        <EuiForm component="form">
          <EuiFormRow label="Name">
            <Controller
              name="accountName"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => {
                return (
                  <EuiFieldText
                    name={field.name}
                    defaultValue={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    autoFocus={true}
                  />
                );
              }}
            />
          </EuiFormRow>
          <EuiFormRow label="Password">
            <Controller
              name="accountPassword"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => {
                return (
                  <EuiFieldPassword
                    name={field.name}
                    defaultValue={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    type="dual"
                  />
                );
              }}
            />
          </EuiFormRow>
        </EuiForm>
      </EuiConfirmModal>
    );
  }, [control, onAccountSaveConfirm, closeModals]);

  const accountEditModal = useMemo(() => {
    return (
      <EuiConfirmModal
        title="Change Password"
        onCancel={closeModals}
        onConfirm={onAccountSaveConfirm}
        cancelButtonText="Cancel"
        confirmButtonText="Save"
        buttonColor="primary"
      >
        <EuiForm component="form">
          <EuiFormRow label="Name">
            <Controller
              name="accountName"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => {
                return (
                  <EuiFieldText
                    name={field.name}
                    defaultValue={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    disabled={true}
                  />
                );
              }}
            />
          </EuiFormRow>
          <EuiFormRow label="Password">
            <Controller
              name="accountPassword"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => {
                return (
                  <EuiFieldPassword
                    name={field.name}
                    defaultValue={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    isInvalid={fieldState.invalid}
                    type="dual"
                    autoFocus={true}
                  />
                );
              }}
            />
          </EuiFormRow>
        </EuiForm>
      </EuiConfirmModal>
    );
  }, [control, onAccountSaveConfirm, closeModals]);

  const accountRemoveModal = useMemo(() => {
    return (
      <EuiConfirmModal
        title={<>Remove account {tableRowItem?.accountName}?</>}
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
  }, [tableRowItem, onAccountRemoveConfirm, closeModals]);

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
              <EuiToolTip content="Change Password" position="bottom">
                <EuiButtonIcon
                  aria-label="Change Password"
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
