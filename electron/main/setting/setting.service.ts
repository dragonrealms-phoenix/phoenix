import path from 'node:path';
import type {
  ClassSetting,
  HighlightSetting,
} from '../../common/setting/types.js';
import type { ClassSettingService } from './class/types.js';
import type { HighlightSettingService } from './highlight/types.js';
import { logger } from './logger.js';
import type { SettingService } from './types.js';

export class SettingServiceImpl implements SettingService {
  private baseDir: string;

  private classService: ClassSettingService;
  // TODO aliasService
  private highlightService: HighlightSettingService;
  // TODO ignoreService
  // TODO macroService
  // TODO substituteService
  // TODO triggerService

  constructor(options: {
    /**
     * Path to the base settings directory, under which
     * contains folders for each profile.
     */
    baseDir: string;
    classService: ClassSettingService;
    highlightService: HighlightSettingService;
  }) {
    this.baseDir = options.baseDir;
    this.classService = options.classService;
    this.highlightService = options.highlightService;
  }

  public getClasses(): Array<ClassSetting> {
    return this.classService.get();
  }

  // TODO get aliases

  public getHighlights(): Array<HighlightSetting> {
    return this.highlightService.get();
  }

  public getEnabledHighlights(): Array<HighlightSetting> {
    const classMap = this.classService.getAsMap();
    return this.getHighlights().filter((setting) => {
      // Presumed enabled unless explicitly disabled.
      return classMap[setting.className] ?? true;
    });
  }

  // TODO get ignores

  // TODO get macros

  // TODO get substitutes

  // TODO get triggers

  public clear(): void {
    logger.debug('clearing settings');

    this.classService.clear();
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
      this.classService.load({
        filePath: path.join(profileDir, 'classes.cfg'),
      }),
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
