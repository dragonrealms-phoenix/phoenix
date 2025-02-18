import sortBy from 'lodash-es/sortBy.js';
import { useCallback, useEffect, useState } from 'react';
import type { Account } from '../../common/account/types.js';
import { runInBackground } from '../lib/async/run-in-background.js';
import { usePubSub, useSubscribe } from './pubsub.jsx';

/**
 * Slightly more performant by reducing rerenders if
 * all you care about is if there are accounts, not what they are.
 */
export const useGetHasAccounts = (): boolean => {
  const [hasAccounts, setHasAccounts] = useState<boolean>(false);

  const accounts = useListAccounts();

  useEffect(() => {
    setHasAccounts(accounts.length > 0);
  }, [accounts]);

  return hasAccounts;
};

/**
 * Returns a list of accounts.
 * Automatically refreshes the list when an account is saved or removed.
 */
export const useListAccounts = (): Array<Account> => {
  const [accounts, setAccounts] = useState<Array<Account>>([]);

  const listAccounts = useCallback(async () => {
    const allAccounts = await window.api.listAccounts();
    const sortedAccounts = sortBy(allAccounts, 'accountName');
    setAccounts(sortedAccounts);
  }, []);

  // Reload when told to.
  useSubscribe('accounts:reload', async () => {
    await listAccounts();
  });

  // Reload on first render.
  useEffect(() => {
    runInBackground(async () => {
      await listAccounts();
    });
  }, [listAccounts]);

  return accounts;
};

type SaveAccountFn = (options: {
  accountName: string;
  accountPassword: string;
}) => Promise<void>;

/**
 * Provides a function that when called saves an account.
 */
export const useSaveAccount = (): SaveAccountFn => {
  const { publish } = usePubSub();

  const fn = useCallback<SaveAccountFn>(
    async (options): Promise<void> => {
      const { accountName, accountPassword } = options;
      publish('account:saving', { accountName });
      await window.api.saveAccount({ accountName, accountPassword });
      publish('account:saved', { accountName });
      publish('accounts:reload');
      publish('toast:add', {
        title: 'Account Saved',
        type: 'success',
        text: accountName,
      });
    },
    [publish]
  );

  return fn;
};

type RemoveAccountFn = (options: { accountName: string }) => Promise<void>;

/**
 * Provides a function that when called removes an account.
 */
export const useRemoveAccount = (): RemoveAccountFn => {
  const { publish } = usePubSub();

  const fn = useCallback<RemoveAccountFn>(
    async (options): Promise<void> => {
      const { accountName } = options;
      publish('account:removing', { accountName });
      await window.api.removeAccount({ accountName });
      publish('account:removed', { accountName });
      publish('accounts:reload');
      publish('toast:add', {
        title: 'Account Removed',
        type: 'success',
        text: accountName,
      });
    },
    [publish]
  );

  return fn;
};
