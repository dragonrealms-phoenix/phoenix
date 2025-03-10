import path from 'node:path';
import type { HighlightSetting } from '../../common/setting/types.js';
import type { HighlightSettingService } from './highlight/types.js';
import { logger } from './logger.js';
import type { SettingService } from './types.js';

export class SettingServiceImpl implements SettingService {
  private baseDir: string;
  private highlightService: HighlightSettingService;

  constructor(options: {
    /**
     * Path to the base settings directory, under which
     * contains folders for each profile.
     */
    baseDir: string;
    highlightService: HighlightSettingService;
  }) {
    this.baseDir = options.baseDir;
    this.highlightService = options.highlightService;
  }

  public getHighlights(): Array<HighlightSetting> {
    return this.highlightService.get();
  }

  public clear(): void {
    logger.debug('clearing settings');

    // TODO clear aliases
    this.highlightService.clear();
    // TODO clear ignores
    // TODO clear macros
    // TODO clear substitutes
    // TODO clear triggers
  }

  public async load(options: {
    /**
     * Load settings for the specified profile.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
  }): Promise<void> {
    const { profileName } = options;

    const profileDir = path.join(this.baseDir, profileName);

    logger.debug('loading settings', { profileName, profileDir });

    await Promise.all([
      // TODO load aliases
      this.highlightService.load({
        filePath: path.join(profileDir, 'highlights.cfg'),
      }),
      // TODO load ignores
      // TODO load macros
      // TODO load substitutes
      // TODO load triggers
    ]);
  }
}
