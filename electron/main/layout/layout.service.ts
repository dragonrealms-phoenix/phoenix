import path from 'node:path';
import fs from 'fs-extra';
import type { Layout } from '../../common/layout/types.js';
import type { Maybe } from '../../common/types.js';
import { logger } from './logger.js';
import type { LayoutService } from './types.js';

export class LayoutServiceImpl implements LayoutService {
  /**
   * Where to store the layouts on disk.
   */
  private baseDir: string;

  constructor(options: { baseDir: string }) {
    this.baseDir = options.baseDir;
  }

  public getLayout(options: { layoutName: string }): Maybe<Layout> {
    const { layoutName } = options;

    const filePath = this.getLayoutPath(layoutName);
    const fileExists = fs.pathExistsSync(filePath);

    logger.debug('getting layout', {
      layoutName,
      filePath,
      fileExists,
    });

    if (!fileExists) {
      return;
    }

    const layout = fs.readJsonSync(filePath);

    logger.debug('got layout', {
      layout,
    });

    return layout;
  }

  public listLayoutNames(): Array<string> {
    const fileNames = fs.readdirSync(this.baseDir);

    const layoutNames = fileNames
      .filter((fileName) => path.extname(fileName) === '.json')
      .map((fileName) => path.basename(fileName, '.json'))
      .sort();

    return layoutNames;
  }

  public saveLayout(options: { layoutName: string; layout: Layout }): void {
    const { layoutName, layout } = options;

    const filePath = this.getLayoutPath(layoutName);

    logger.debug('saving layout', {
      layoutName,
      filePath,
    });

    fs.ensureFileSync(filePath);

    fs.writeJsonSync(filePath, layout, { spaces: 2 });

    logger.debug('saved layout', {
      layout,
    });
  }

  public deleteLayout(options: { layoutName: string }): void {
    const { layoutName } = options;

    const filePath = this.getLayoutPath(layoutName);
    const fileExists = fs.pathExistsSync(filePath);

    logger.debug('deleting layout', {
      layoutName,
      filePath,
      fileExists,
    });

    if (!fileExists) {
      return;
    }

    fs.removeSync(filePath);

    logger.debug('deleted layout', {
      layoutName,
    });
  }

  protected getLayoutPath(name: string): string {
    return path.join(this.baseDir, `${name}.json`);
  }
}
