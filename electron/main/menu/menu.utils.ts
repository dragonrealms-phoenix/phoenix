import type { MenuItem } from 'electron';
import { Menu } from 'electron';
import type { Maybe } from '../../common/types';
import { convertToMaybe } from '../../common/types';

export const getMenuItemById = (menuItemId: string): Maybe<MenuItem> => {
  const menu = Menu.getApplicationMenu();
  if (menu) {
    return convertToMaybe(menu.getMenuItemById(menuItemId));
  }
};
