import type { Layout } from '../../common/layout/types.js';
import type { Maybe } from '../../common/types.js';

export interface LayoutService {
  /**
   * Gets a layout by name.
   * Example: 'default' to get 'path/to/layouts/default.json'.
   */
  getLayout(options: { layoutName: string }): Promise<Maybe<Layout>>;

  /**
   * Lists all layout names.
   */
  listLayoutNames(): Promise<Array<string>>;

  /**
   * Saves a layout by name.
   * Example: 'default' to save 'path/to/layouts/default.json'.
   */
  saveLayout(options: {
    /**
     * Name to associate to this layout configuration.
     */
    layoutName: string;
    /**
     * Layout configuration to save.
     */
    layout: Layout;
  }): Promise<void>;

  /**
   * Deletes a layout by name.
   * Example: 'default' to delete 'path/to/layouts/default.json'.
   */
  deleteLayout(options: { layoutName: string }): Promise<void>;
}
