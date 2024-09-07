import sortBy from 'lodash-es/sortBy.js';
import { useCallback, useEffect, useState } from 'react';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { Account } from '../types/game.types.js';
import { usePubSub, useSubscribe } from './pubsub.jsx';

/**
 * Returns a list of accounts.
 * Automatically refreshes the list when an account is saved or removed.
 */
export const useListAccounts = (): Array<Account> => {
  const [accounts, setAccounts] = useState<Array<Account>>([]);

  const loadAccounts = useCallback(async () => {
    const allAccounts = await window.api.listAccounts();
    const sortedAccounts = sortBy(allAccounts, 'accountName');
    setAccounts(sortedAccounts);
  }, []);

  // Reload when told to.
  useSubscribe('accounts:reload', async () => {
    await loadAccounts();
  });

  // Reload on first render.
  useEffect(() => {
    runInBackground(async () => {
      await loadAccounts();
    });
  }, [loadAccounts]);

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
      await window.api.saveAccount({ accountName, accountPassword });
      publish('account:saved', { accountName });
      publish('accounts:reload');
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
      await window.api.removeAccount({ accountName });
      publish('account:removed', { accountName });
      publish('accounts:reload');
    },
    [publish]
  );

  return fn;
};
