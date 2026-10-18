import fs from 'fs-extra';
import type { IgnoreSetting } from '../../../common/setting/types.js';
import { isBlank } from '../../../common/string/string.utils.js';
import type { Maybe } from '../../../common/types.js';
import { logger } from '../logger.js';
import { parseLines } from '../setting.utils.js';
import { buildIgnoreSetting } from './ignore.utils.js';
import type { IgnoreSettingService } from './types.js';

// I fully appreciate the irony of using regex to parse regex.
// https://regex101.com/r/6NB9SU/1
const PATTERN_REGEX = /{(?<pattern>.+?)}/;
const CLASS_REGEX = /{(?<className>.+?)}/;

const SETTING_LINE_REGEX = new RegExp(
  `^#(?:gags?|ignores?)\\s*${PATTERN_REGEX.source}\\s*(?:${CLASS_REGEX.source})?$`
);

export class IgnoreSettingServiceImpl implements IgnoreSettingService {
  private settings: Array<IgnoreSetting>;

  constructor(settings: Array<IgnoreSetting> = []) {
    this.settings = settings;
  }

  public add(settings: Array<IgnoreSetting>): void {
    this.settings.push(...settings);
  }

  public get(): Array<IgnoreSetting> {
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
     * #ignore {pattern} {class}
     * ```
     * Where `pattern` is the string or regex pattern to match.
     * Where `class` is the name of the class to assign the setting to.
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

    logger.debug('loading ignore file', { filePath, mode });

    if (mode === 'replace') {
      this.clear();
    }

    const parsedSettings = await this.parseFile({ filePath });
    this.add(parsedSettings);
  }

  protected async parseFile(options: {
    filePath: string;
  }): Promise<Array<IgnoreSetting>> {
    const { filePath } = options;

    logger.debug('parsing ignore file', { filePath });

    if (!fs.pathExistsSync(filePath)) {
      logger.debug('ignore file not found, skipping', { filePath });
      return [];
    }

    try {
      const settings = await parseLines<IgnoreSetting>({
        readStream: fs.createReadStream(filePath, 'utf8'),
        parse: (line) => this.parseLine({ line }),
      });
      logger.debug('done parsing ignore file', {
        filePath,
        count: settings.length,
      });
      return settings;
    } catch (error) {
      logger.error('error parsing ignore file', {
        filePath,
        error,
      });
      return [];
    }
  }

  /**
   * Syntax:
   * ```
   * #ignore {pattern} {class}
   * ```
   *
   * Example:
   * ```
   * #ignore {^(You feel fully attuned to the mana streams again.)$} {magic}
   * ```
   */
  protected parseLine(options: { line: string }): Maybe<IgnoreSetting> {
    const { line } = options;

    if (isBlank(line)) {
      return;
    }

    if (!line.startsWith('#ignore') && !line.startsWith('#gag')) {
      return;
    }

    const match = SETTING_LINE_REGEX.exec(line.trim());

    if (!match?.groups) {
      return;
    }

    return buildIgnoreSetting({
      pattern: match.groups.pattern,
      className: match.groups.className,
    });
  }
}
