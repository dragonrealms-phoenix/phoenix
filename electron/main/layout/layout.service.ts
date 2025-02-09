import { app } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import type { Maybe } from '../../common/types.js';
import { logger } from './logger.js';
import type { Layout, LayoutService } from './types.js';

export class LayoutServiceImpl implements LayoutService {
  public async get(name: string): Promise<Maybe<Layout>> {
    const filePath = this.getLayoutPath(name);
    const fileExists = await fs.pathExists(filePath);

    logger.info('getting layout', {
      name,
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

  public async list(): Promise<Array<string>> {
    const fileNames = await fs.readdir(this.getLayoutsBaseDir());

    const layoutNames = fileNames
      .filter((fileName) => path.extname(fileName) === '.json')
      .map((fileName) => path.basename(fileName, '.json'))
      .sort();

    return layoutNames;
  }

  public async save(options: { name: string; layout: Layout }): Promise<void> {
    const { name, layout } = options;

    const filePath = this.getLayoutPath(name);

    logger.info('saving layout', {
      name,
      filePath,
    });

    await fs.ensureFile(filePath);

    await fs.writeJson(filePath, layout, { spaces: 2 });

    logger.debug('saved layout', {
      layout,
    });
  }

  public async delete(name: string): Promise<void> {
    const filePath = this.getLayoutPath(name);
    const fileExists = await fs.pathExists(filePath);

    logger.info('deleting layout', {
      name,
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
