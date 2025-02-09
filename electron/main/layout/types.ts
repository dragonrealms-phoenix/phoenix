import type { Layout } from '../../common/layout/types.js';
import type { Maybe } from '../../common/types.js';

export interface LayoutService {
  /**
   * Gets a layout by name.
   * Example: 'default' to get 'path/to/layouts/default.json'.
   */
  get(name: string): Promise<Maybe<Layout>>;

  /**
   * Lists all layout names.
   */
  list(): Promise<Array<string>>;

  /**
   * Saves a layout by name.
   * Example: 'default' to save 'path/to/layouts/default.json'.
   */
  save(options: {
    /**
     * Name to associate to this layout configuration.
     */
    name: string;
    /**
     * Layout configuration to save.
     */
    layout: Layout;
  }): Promise<void>;

  /**
   * Deletes a layout by name.
   * Example: 'default' to delete 'path/to/layouts/default.json'.
   */
  delete(name: string): Promise<void>;
}
