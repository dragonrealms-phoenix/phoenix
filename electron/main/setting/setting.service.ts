import path from 'node:path';
import type { IgnoreSetting } from 'common/setting/types';
import type {
  ClassSetting,
  HighlightSetting,
  SubstituteSetting,
  TriggerSetting,
} from '../../common/setting/types.js';
import type { ClassSettingService } from './class/types.js';
import type { HighlightSettingService } from './highlight/types.js';
import type { IgnoreSettingService } from './ignore/types.js';
import { logger } from './logger.js';
import type { SubstituteSettingService } from './substitute/types.js';
import type { TriggerSettingService } from './trigger/types.js';
import type { SettingService } from './types.js';

export class SettingServiceImpl implements SettingService {
  private baseDir: string;

  private classService: ClassSettingService;
  // TODO aliasService
  private highlightService: HighlightSettingService;
  private ignoreService: IgnoreSettingService;
  // TODO macroService
  private substituteService: SubstituteSettingService;
  private triggerService: TriggerSettingService;

  constructor(options: {
    /**
     * Path to the base settings directory, under which
     * contains folders for each profile.
     */
    baseDir: string;
    classService: ClassSettingService;
    highlightService: HighlightSettingService;
    ignoreService: IgnoreSettingService;
    substituteService: SubstituteSettingService;
    triggerService: TriggerSettingService;
  }) {
    this.baseDir = options.baseDir;
    this.classService = options.classService;
    this.highlightService = options.highlightService;
    this.ignoreService = options.ignoreService;
    this.substituteService = options.substituteService;
    this.triggerService = options.triggerService;
  }

  public getClasses(): Array<ClassSetting> {
    return this.classService.get();
  }

  public upsertClass(setting: ClassSetting): void {
    this.classService.upsert([setting]);
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

  public getIgnores(): Array<IgnoreSetting> {
    return this.ignoreService.get();
  }

  public getEnabledIgnores(): Array<IgnoreSetting> {
    const classMap = this.classService.getAsMap();
    return this.getIgnores().filter((setting) => {
      // Presumed enabled unless explicitly disabled.
      return classMap[setting.className] ?? true;
    });
  }

  // TODO get macros

  public getSubstitutes(): Array<SubstituteSetting> {
    return this.substituteService.get();
  }

  public getEnabledSubstitutes(): Array<SubstituteSetting> {
    const classMap = this.classService.getAsMap();
    return this.getSubstitutes().filter((setting) => {
      // Presumed enabled unless explicitly disabled.
      return classMap[setting.className] ?? true;
    });
  }

  public getTriggers(): Array<TriggerSetting> {
    return this.triggerService.get();
  }

  public getEnabledTriggers(): Array<TriggerSetting> {
    const classMap = this.classService.getAsMap();
    return this.getTriggers().filter((setting) => {
      // Presumed enabled unless explicitly disabled.
      return classMap[setting.className] ?? true;
    });
  }

  public clear(): void {
    logger.debug('clearing settings');

    this.classService.clear();
    // TODO clear aliases
    this.highlightService.clear();
    this.ignoreService.clear();
    // TODO clear macros
    this.substituteService.clear();
    this.triggerService.clear();
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
      this.ignoreService.load({
        filePath: path.join(profileDir, 'gags.cfg'), // name used by Genie
      }),
      this.ignoreService.load({
        filePath: path.join(profileDir, 'ignores.cfg'), // alternate name
      }),
      // TODO load macros
      this.substituteService.load({
        filePath: path.join(profileDir, 'substitutes.cfg'),
      }),
      this.triggerService.load({
        filePath: path.join(profileDir, 'triggers.cfg'),
      }),
    ]);
  }
}
