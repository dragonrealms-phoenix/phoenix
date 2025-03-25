import fs from 'fs-extra';
import type { SubstituteSetting } from '../../../common/setting/types.js';
import { isBlank } from '../../../common/string/string.utils.js';
import type { Maybe } from '../../../common/types.js';
import { logger } from '../logger.js';
import { parseLines } from '../setting.utils.js';
import { buildSubstituteSetting } from './substitute.utils.js';
import type { SubstituteSettingService } from './types.js';

// I fully appreciate the irony of using regex to parse regex.
// https://regex101.com/r/jeUuIG/1
const PATTERN_REGEX = /{(?<pattern>.+?)}/;
const REPLACEMENT_REGEX = /{(?<replacement>.+?)}/;
const CLASS_REGEX = /{(?<className>.+?)}/;

const SETTING_LINE_REGEX = new RegExp(
  `^#(?:subs?|substitutes?)\\s*${PATTERN_REGEX.source}\\s*${REPLACEMENT_REGEX.source}\\s*(?:${CLASS_REGEX.source})?$`
);

export class SubstituteSettingServiceImpl implements SubstituteSettingService {
  private settings: Array<SubstituteSetting>;

  constructor(settings: Array<SubstituteSetting> = []) {
    this.settings = settings;
  }

  public add(settings: Array<SubstituteSetting>): void {
    this.settings.push(...settings);
  }

  public get(): Array<SubstituteSetting> {
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
     * #subs {pattern} {replacement} {class}
     * ```
     * Where `pattern` is the string or regex pattern to match.
     * Where `replacement` is the string to replace the matched text with.
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

    logger.debug('loading substitute file', { filePath, mode });

    if (mode === 'replace') {
      this.clear();
    }

    const parsedSettings = await this.parseFile({ filePath });
    this.add(parsedSettings);
  }

  protected async parseFile(options: {
    filePath: string;
  }): Promise<Array<SubstituteSetting>> {
    const { filePath } = options;

    logger.debug('parsing substitute file', { filePath });

    if (!fs.pathExistsSync(filePath)) {
      logger.debug('substitute file not found, skipping', { filePath });
      return [];
    }

    try {
      const settings = await parseLines<SubstituteSetting>({
        readStream: fs.createReadStream(filePath, 'utf8'),
        parse: (line) => this.parseLine({ line }),
      });
      logger.debug('done parsing substitute file', {
        filePath,
        count: settings.length,
      });
      return settings;
    } catch (error) {
      logger.error('error parsing substitute file', {
        filePath,
        error,
      });
      return [];
    }
  }

  /**
   * Syntax:
   * ```
   * #substitute {pattern} {replacement} {class}
   * ```
   *
   * Example:
   * ```
   * #substitute {a light hit} {a light hit (1/22)} {combat}
   * #substitute {leaving (.+) slightly healed} {leaving $1 slightly (1/6) healed} {wounds}
   * ```
   */
  protected parseLine(options: { line: string }): Maybe<SubstituteSetting> {
    const { line } = options;

    if (isBlank(line)) {
      return;
    }

    if (!line.startsWith('#sub')) {
      return;
    }

    const match = SETTING_LINE_REGEX.exec(line.trim());

    if (!match?.groups) {
      return;
    }

    return buildSubstituteSetting({
      pattern: match.groups.pattern,
      replacement: match.groups.replacement,
      className: match.groups.className,
    });
  }
}
