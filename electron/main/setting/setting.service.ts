import path from 'node:path';
import type { FSWatcher } from 'chokidar';
import { watch } from 'chokidar';
import type { IgnoreSetting } from 'common/setting/types';
import * as rxjs from 'rxjs';
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
  private fileWatcher: FSWatcher;
  private loadedProfileNames: Array<string>;

  private classService: ClassSettingService;
  // TODO aliasService
  private highlightService: HighlightSettingService;
  private ignoreService: IgnoreSettingService;
  // TODO macroService
  private substituteService: SubstituteSettingService;
  private triggerService: TriggerSettingService;

  private classesFileChange$: rxjs.Subject<string>;
  private highlightsFileChange$: rxjs.Subject<string>;
  private ignoresFileChange$: rxjs.Subject<string>;
  private substitutesFileChange$: rxjs.Subject<string>;
  private triggersFileChange$: rxjs.Subject<string>;

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

    this.classesFileChange$ = new rxjs.Subject();
    this.highlightsFileChange$ = new rxjs.Subject();
    this.ignoresFileChange$ = new rxjs.Subject();
    this.substitutesFileChange$ = new rxjs.Subject();
    this.triggersFileChange$ = new rxjs.Subject();

    this.fileWatcher = this.newFileWatcher();
    this.loadedProfileNames = [];
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

  public async clear(): Promise<void> {
    logger.debug('clearing settings');

    await this.fileWatcher.close();
    this.fileWatcher = this.newFileWatcher();
    this.loadedProfileNames = [];

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
     * Load settings for the specified profiles.
     * For example, `default` or `KatoakDR`.
     */
    profileNames: Array<string>;
    /**
     * Whether to append to previously loaded settings or replace them.
     * Using `replace` is the same as calling {@link clear} then {@link load}.
     * Default is `append`.
     */
    mode?: 'append' | 'replace';
  }): Promise<void> {
    const { profileNames, mode = 'append' } = options;

    logger.debug('loading settings', {
      profileNames,
      mode,
    });

    if (mode === 'replace') {
      await this.clear();
    }

    const profileDirs = profileNames.map((profileName) => {
      return this.getProfileDir(profileName);
    });

    this.loadedProfileNames.push(...profileNames);
    this.fileWatcher.add(profileDirs);
  }

  protected async loadClasses(options: {
    /**
     * Load classes for the specified profile.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
  }): Promise<void> {
    const { profileName } = options;

    await this.classService.load({
      filePath: this.getSettingFilePath({
        profileName,
        fileName: 'classes.cfg',
      }),
    });
  }

  protected async loadHighlights(options: {
    /**
     * Load highlights for the specified profile.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
  }): Promise<void> {
    const { profileName } = options;

    await this.highlightService.load({
      filePath: this.getSettingFilePath({
        profileName,
        fileName: 'highlights.cfg',
      }),
    });
  }

  protected async loadIgnores(options: {
    /**
     * Load ignores for the specified profile.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
  }): Promise<void> {
    const { profileName } = options;

    await this.ignoreService.load({
      filePath: this.getSettingFilePath({
        profileName,
        fileName: 'gags.cfg', // name used by Genie
      }),
    });

    await this.ignoreService.load({
      filePath: this.getSettingFilePath({
        profileName,
        fileName: 'ignores.cfg', // alternate name
      }),
    });
  }

  protected async loadSubstitutes(options: {
    /**
     * Load substitutes for the specified profile.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
  }): Promise<void> {
    const { profileName } = options;

    await this.substituteService.load({
      filePath: this.getSettingFilePath({
        profileName,
        fileName: 'substitutes.cfg',
      }),
    });
  }

  protected async loadTriggers(options: {
    /**
     * Load triggers for the specified profile.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
  }): Promise<void> {
    const { profileName } = options;

    await this.triggerService.load({
      filePath: this.getSettingFilePath({
        profileName,
        fileName: 'triggers.cfg',
      }),
    });
  }

  protected getSettingFilePath(options: {
    /**
     * The profile whose settings file to get.
     * For example, `default` or `KatoakDR`.
     */
    profileName: string;
    /**
     * The name of the settings file to get.
     * For example, `classes.cfg` or `triggers.cfg`.
     */
    fileName: string;
  }): string {
    const { profileName, fileName } = options;

    return path.join(this.getProfileDir(profileName), fileName);
  }

  protected getProfileDir(profileName: string): string {
    return path.join(this.baseDir, profileName);
  }

  protected newFileWatcher(): FSWatcher {
    this.classesFileChange$.complete();
    this.classesFileChange$ = new rxjs.Subject();
    this.classesFileChange$
      .pipe(
        rxjs.concatMap(async () => {
          logger.debug('reloading classes');
          this.classService.clear();
          for (const profileName of this.loadedProfileNames) {
            await this.loadClasses({ profileName });
          }
        })
      )
      .subscribe();

    this.highlightsFileChange$.complete();
    this.highlightsFileChange$ = new rxjs.Subject();
    this.highlightsFileChange$
      .pipe(
        rxjs.concatMap(async () => {
          logger.debug('reloading highlights');
          this.highlightService.clear();
          for (const profileName of this.loadedProfileNames) {
            await this.loadHighlights({ profileName });
          }
        })
      )
      .subscribe();

    this.ignoresFileChange$.complete();
    this.ignoresFileChange$ = new rxjs.Subject();
    this.ignoresFileChange$
      .pipe(
        rxjs.concatMap(async () => {
          logger.debug('reloading ignores');
          this.ignoreService.clear();
          for (const profileName of this.loadedProfileNames) {
            await this.loadIgnores({ profileName });
          }
        })
      )
      .subscribe();

    this.substitutesFileChange$.complete();
    this.substitutesFileChange$ = new rxjs.Subject();
    this.substitutesFileChange$
      .pipe(
        rxjs.concatMap(async () => {
          logger.debug('reloading substitutes');
          this.substituteService.clear();
          for (const profileName of this.loadedProfileNames) {
            await this.loadSubstitutes({ profileName });
          }
        })
      )
      .subscribe();

    this.triggersFileChange$.complete();
    this.triggersFileChange$ = new rxjs.Subject();
    this.triggersFileChange$
      .pipe(
        rxjs.concatMap(async () => {
          logger.debug('reloading triggers');
          this.triggerService.clear();
          for (const profileName of this.loadedProfileNames) {
            await this.loadTriggers({ profileName });
          }
        })
      )
      .subscribe();

    return watch([], {
      /**
       * Only monitor files immediately under the profile directory.
       */
      depth: 1,
      /**
       * Don't watch files that we don't have READ permissions.
       */
      ignorePermissionErrors: true,
      /**
       * Wait for files to finish writing before emitting their events.
       * This is inferred from the file size not changing for a period of time.
       */
      awaitWriteFinish: {
        /**
         * Amount of time in milliseconds for a file size
         * to remain constant before emitting its event.
         */
        stabilityThreshold: 1000,
        /**
         * Amount of time in milliseconds to poll the file size.
         */
        pollInterval: 100,
      },
    })
      .on('add', (filePath: string) => {
        logger.debug('file added', { filePath });
        this.notifyFileChanged({ filePath, changeType: 'create' });
      })
      .on('change', (filePath: string) => {
        logger.debug('file changed', { filePath });
        this.notifyFileChanged({ filePath, changeType: 'update' });
      })
      .on('unlink', (filePath: string) => {
        // Although the file no longer exists, we do want to reload the
        // settings that the file was for (e.g. 'classes' or 'triggers').
        // This effectively clears the settings for that file and loads
        // back the settings for whichever loaded profiles remain.
        logger.debug('file removed', { filePath });
        this.notifyFileChanged({ filePath, changeType: 'delete' });
      })
      .on('error', (error) =>
        logger.error('error watching settings files', {
          baseDir: this.baseDir,
          profileNames: this.loadedProfileNames,
          error,
        })
      );
  }

  protected notifyFileChanged(options: {
    filePath: string;
    changeType: 'create' | 'update' | 'delete';
  }): void {
    const { filePath, changeType } = options;

    const fileName = path.basename(filePath);

    logger.debug('notifying file changed', {
      filePath,
      fileName,
      changeType,
    });

    switch (fileName) {
      case 'classes.cfg':
        this.classesFileChange$.next(fileName);
        break;
      case 'highlights.cfg':
        this.highlightsFileChange$.next(fileName);
        break;
      case 'gags.cfg':
      case 'ignores.cfg':
        this.ignoresFileChange$.next(fileName);
        break;
      case 'substitutes.cfg':
        this.substitutesFileChange$.next(fileName);
        break;
      case 'triggers.cfg':
        this.triggersFileChange$.next(fileName);
        break;
    }
  }
}
