import { app } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import type { Layout } from '../../common/layout/types.js';
import type { Maybe } from '../../common/types.js';
import { logger } from './logger.js';
import type { LayoutService } from './types.js';

export class LayoutServiceImpl implements LayoutService {
  public async getLayout(options: {
    layoutName: string;
  }): Promise<Maybe<Layout>> {
    const { layoutName } = options;

    const filePath = this.getLayoutPath(layoutName);
    const fileExists = await fs.pathExists(filePath);

    logger.info('getting layout', {
      layoutName,
      filePath,
      fileExists,
    });

    if (!fileExists) {
      return;
    }

    const layout = await fs.readJson(filePath);

    logger.debug('got layout', {
      layout,
    });

    return layout;
  }

  public async listLayoutNames(): Promise<Array<string>> {
    const fileNames = await fs.readdir(this.getLayoutsBaseDir());

    const layoutNames = fileNames
      .filter((fileName) => path.extname(fileName) === '.json')
      .map((fileName) => path.basename(fileName, '.json'))
      .sort();

    return layoutNames;
  }

  public async saveLayout(options: {
    layoutName: string;
    layout: Layout;
  }): Promise<void> {
    const { layoutName, layout } = options;

    const filePath = this.getLayoutPath(layoutName);

    logger.info('saving layout', {
      layoutName,
      filePath,
    });

    await fs.ensureFile(filePath);

    await fs.writeJson(filePath, layout, { spaces: 2 });

    logger.debug('saved layout', {
      layout,
    });
  }

  public async deleteLayout(options: { layoutName: string }): Promise<void> {
    const { layoutName } = options;

    const filePath = this.getLayoutPath(layoutName);
    const fileExists = await fs.pathExists(filePath);

    logger.info('deleting layout', {
      layoutName,
      filePath,
      fileExists,
    });

    if (!fileExists) {
      return;
    }

    await fs.remove(filePath);
  }

  protected getLayoutPath(name: string): string {
    return path.join(this.getLayoutsBaseDir(), `${name}.json`);
  }

  protected getLayoutsBaseDir(): string {
    return path.join(app.getPath('userData'), 'layouts');
  }
}
