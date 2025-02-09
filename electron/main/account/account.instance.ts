import { Store } from '../store/store.instance.js';
import { AccountServiceImpl } from './account.service.js';

// There is exactly one account instance so that it's
// easy anywhere in the app to manage accounts and characters.
export const Accounts = new AccountServiceImpl({
  storeService: Store,
});
