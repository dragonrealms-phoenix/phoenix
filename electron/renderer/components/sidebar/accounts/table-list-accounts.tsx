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
import { useListAccounts } from '../../../hooks/accounts.jsx';
import type { Account } from '../../../types/game.types.js';

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
                  <EuiToolTip content="Log Out" position="bottom">
                    <EuiButtonIcon
                      aria-label="Log Out"
                      iconType="exit"
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
