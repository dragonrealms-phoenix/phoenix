import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiCode,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Maybe } from '../../../common/types.js';
import { runInBackground } from '../../lib/async/run-in-background.js';

interface TableRowItem {
  accountName: string;
}

export const SidebarItemAccounts: React.FC = (): ReactNode => {
  // When displaying models to add, edit, or remove an account,
  // this record indicates the contextual record from the table.
  const [record, setRecord] = useState<Maybe<TableRowItem>>(undefined);

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showRemoveAccountModal, setShowRemoveAccountModal] = useState(false);

  const [tableRowItems, setTableRowItems] = useState<Array<TableRowItem>>([]);

  const loadAccounts = useCallback(async () => {
    const accounts = await window.api.listAccounts();

    setTableRowItems(
      accounts.map((account) => {
        return {
          accountName: account.accountName,
        };
      })
    );
  }, []);

  const closeModals = useCallback(() => {
    setShowAddAccountModal(false);
    setShowEditAccountModal(false);
    setShowRemoveAccountModal(false);
    setRecord(undefined);
  }, []);

  const onAddAccountClick = useCallback(() => {
    // TODO show prompt to enter account name and password
    closeModals();
    setRecord({ accountName: '' });
    setShowAddAccountModal(true);
  }, [closeModals]);

  const onEditAccountClick = useCallback(
    (tableRowItem: TableRowItem) => {
      // TODO show prompt to edit account name and password
      closeModals();
      setRecord(tableRowItem);
      setShowEditAccountModal(true);
    },
    [closeModals]
  );

  const onRemoveAccountClick = useCallback(
    (tableRowItem: TableRowItem) => {
      closeModals();
      setRecord(tableRowItem);
      setShowRemoveAccountModal(true);
    },
    [closeModals]
  );

  const onAccountRemoveConfirm = useCallback(() => {
    if (!record) {
      return;
    }
    runInBackground(async () => {
      closeModals();
      await window.api.removeAccount({
        accountName: record.accountName,
      });
      await loadAccounts();
    });
  }, [record, loadAccounts, closeModals]);

  const accountAddModal = useMemo(() => {
    return <>add</>;
  }, []);

  const accountEditModal = useMemo(() => {
    return <>edit</>;
  }, []);

  const accountRemoveModal = useMemo(() => {
    return (
      <EuiConfirmModal
        title={
          <>
            Remove account <EuiCode>{record?.accountName}</EuiCode>?
          </>
        }
        onCancel={closeModals}
        onConfirm={onAccountRemoveConfirm}
        cancelButtonText="Cancel"
        confirmButtonText="Remove"
        buttonColor="danger"
        defaultFocusedButton="cancel"
      >
        Any associated characters will also be removed.
      </EuiConfirmModal>
    );
  }, [record, closeModals, onAccountRemoveConfirm]);

  useEffect(() => {
    runInBackground(async () => {
      await loadAccounts();
    });
  }, [loadAccounts]);

  const columns: Array<EuiBasicTableColumn<TableRowItem>> = [
    {
      field: 'accountName',
      name: 'Account',
      dataType: 'string',
    },
    {
      field: 'actions',
      name: 'Actions',
      render: (_value: unknown, record: TableRowItem) => {
        return (
          <EuiFlexGroup responsive={true} gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Edit account" position="bottom">
                <EuiButtonIcon
                  iconType="pencil"
                  display="base"
                  color="warning"
                  onClick={() => onEditAccountClick(record)}
                />
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Remove account" position="bottom">
                <EuiButtonIcon
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
