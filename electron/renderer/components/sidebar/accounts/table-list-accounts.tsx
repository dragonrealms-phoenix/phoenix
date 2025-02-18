import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiToolTip,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import type { Account } from '../../../../common/account/types.js';
import { useListAccounts } from '../../../hooks/accounts.jsx';

export interface TableListAccountsProps {
  onEditAccountClick: (account: Account) => void;
  onRemoveAccountClick: (account: Account) => void;
}

export const TableListAccounts: React.FC<TableListAccountsProps> = memo(
  (props: TableListAccountsProps): ReactNode => {
    const { onEditAccountClick, onRemoveAccountClick } = props;

    // All accounts to display.
    const accounts = useListAccounts();

    const columns = useMemo<Array<EuiBasicTableColumn<Account>>>(() => {
      return [
        {
          field: 'accountName',
          name: 'Name',
          dataType: 'string',
          truncateText: true,
        },
        {
          field: 'actions',
          name: 'Actions',
          width: '25%',
          render: (_value: unknown, account: Account) => {
            return (
              <EuiFlexGroup
                responsive={true}
                gutterSize="s"
                alignItems="center"
              >
                <EuiFlexItem grow={false}>
                  <EuiToolTip content="Change Password" position="bottom">
                    <EuiButtonIcon
                      aria-label="Change Password"
                      iconType="lock"
                      display="base"
                      color="warning"
                      onClick={() => onEditAccountClick(account)}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content="Remove" position="bottom">
                    <EuiButtonIcon
                      aria-label="Remove"
                      iconType="cross"
                      display="base"
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
    }, [onEditAccountClick, onRemoveAccountClick]);

    return (
      <>
        {accounts.length > 0 && (
          <EuiInMemoryTable items={accounts} columns={columns} />
        )}
      </>
    );
  }
);

TableListAccounts.displayName = 'TableListAccounts';
