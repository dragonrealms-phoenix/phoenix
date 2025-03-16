import fs from 'fs-extra';
import type { ClassSetting } from '../../../common/setting/types.js';
import { isBlank } from '../../../common/string/string.utils.js';
import type { Maybe } from '../../../common/types.js';
import { logger } from '../logger.js';
import { parseLines } from '../setting.utils.js';
import { buildClassSetting, toClassMap } from './class.utils.js';
import type { ClassSettingService } from './types.js';

// I fully appreciate the irony of using regex to parse regex.
// https://regex101.com/r/Q48LbC/1
const NAME_REGEX = /{(?<name>.+?)}/;
const ENABLED_REGEX = /{(?<enabled>.+?)}/;

const SETTING_LINE_REGEX = new RegExp(
  `^#class\\s*${NAME_REGEX.source}\\s*${ENABLED_REGEX.source}\\s*$`
);

export class ClassSettingServiceImpl implements ClassSettingService {
  private settings: Array<ClassSetting>;

  constructor() {
    this.settings = [];
  }

  public getAsMap(): Record<string, boolean> {
    return toClassMap(this.settings);
  }

  public get(): Array<ClassSetting> {
    return this.settings;
  }

  public clear(): void {
    this.settings = [];
  }

  public async load(options: {
    /**
     * Path to the settings file.
     *
     * A setting line has the format:
     * ```
     * #class {name} {enabled}
     * ```
     * Where `name` is the name of the class, like a guild or character name or whatever.
     * Where `enabled` is a boolean value, either `true` or `false`.
     */
    filePath: string;
    /**
     * Whether to append to previously loaded settings or replace them.
     * Using `replace` is the same as calling {@link clear} then {@link load}.
     * Default is `append`.
     */
    mode?: 'append' | 'replace';
  }): Promise<void> {
    const { filePath, mode = 'append' } = options;

    logger.debug('loading class file', { filePath, mode });

    if (mode === 'replace') {
      this.clear();
    }

    const parsedSettings = await this.parseFile({ filePath });
    this.settings.push(...parsedSettings);
  }

  protected async parseFile(options: {
    filePath: string;
  }): Promise<Array<ClassSetting>> {
    const { filePath } = options;

    logger.debug('parsing class file', { filePath });

    if (!fs.pathExistsSync(filePath)) {
      logger.debug('class file not found, skipping', { filePath });
      return [];
    }

    try {
      const settings = await parseLines<ClassSetting>({
        readStream: fs.createReadStream(filePath, 'utf8'),
        parse: (line) => this.parseLine({ line }),
      });
      logger.debug('done parsing class file', {
        filePath,
        count: settings.length,
      });
      return settings;
    } catch (error) {
      logger.error('error parsing class file', {
        filePath,
        error,
      });
      return [];
    }
  }

  /**
   * Syntax:
   * ```
   * #class {name} {enabled}
   * ```
   *
   * Example:
   * ```
   * #class {katoak} {true}
   * #class {thief} {true}
   * #class {barbarian} {false}
   * #class {combat} {true}
   * ```
   */
  protected parseLine(options: { line: string }): Maybe<ClassSetting> {
    const { line } = options;

    if (isBlank(line)) {
      return;
    }

    if (!line.startsWith('#class')) {
      return;
    }

    const match = SETTING_LINE_REGEX.exec(line.trim());

    if (!match?.groups) {
      return;
    }

    return buildClassSetting({
      name: match.groups.name,
      enabled: match.groups.enabled,
    });
  }
}
