import { sortBy } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { Account } from '../types/game.types.js';

export function useListAccounts(): Array<Account> {
  const [accounts, setAccounts] = useState<Array<Account>>([]);

  // TODO subscribe to pubsub to know when should reload accounts
  //      e.g. when an account is added, updated, or removed

  const loadAccounts = useCallback(async () => {
    const allAccounts = await window.api.listAccounts();

    const sortedAccounts = sortBy(allAccounts, 'accountName');

    setAccounts(sortedAccounts);
  }, []);

  useEffect(() => {
    runInBackground(async () => {
      await loadAccounts();
    });
  }, [loadAccounts]);

  return accounts;
}