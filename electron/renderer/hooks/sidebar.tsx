import { useCallback } from 'react';
import { SidebarId } from '../types/sidebar.types.js';
import { usePubSub } from './pubsub.jsx';

type ShowSidebarFn = (sidebarId: SidebarId) => void;

/**
 * Provides a function that when called switches to the specified sidebar.
 */
export const useShowSidebar = (): ShowSidebarFn => {
  const { publish } = usePubSub();

  const fn = useCallback<ShowSidebarFn>(
    (sidebarId: SidebarId): void => {
      publish('sidebar:show', sidebarId);
    },
    [publish]
  );

  return fn;
};

type ShowSidebarAccountsFn = () => void;

/**
 * Provides a function that when called switches to the accounts sidebar.
 */
export const useShowSidebarAccounts = (): ShowSidebarAccountsFn => {
  const showSidebar = useShowSidebar();

  const fn = useCallback<ShowSidebarAccountsFn>(() => {
    showSidebar(SidebarId.Accounts);
  }, [showSidebar]);

  return fn;
};

type ShowSidebarCharactersFn = () => void;

/**
 * Provides a function that when called switches to the characters sidebar.
 */
export const useShowSidebarCharacters = (): ShowSidebarCharactersFn => {
  const showSidebar = useShowSidebar();

  const fn = useCallback<ShowSidebarCharactersFn>(() => {
    showSidebar(SidebarId.Characters);
  }, [showSidebar]);

  return fn;
};

type ShowSidebarSettingsFn = () => void;

/**
 * Provides a function that when called switches to the settings sidebar.
 */
export const useShowSidebarSettings = (): ShowSidebarSettingsFn => {
  const showSidebar = useShowSidebar();

  const fn = useCallback<ShowSidebarSettingsFn>(() => {
    showSidebar(SidebarId.Settings);
  }, [showSidebar]);

  return fn;
};
