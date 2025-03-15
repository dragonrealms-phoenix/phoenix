import fs from 'fs-extra';
import type { HighlightSetting } from '../../../common/setting/types.js';
import { isBlank } from '../../../common/string/string.utils.js';
import type { Maybe } from '../../../common/types.js';
import { parseLines } from '../setting.utils.js';
import { buildHighlightSetting } from './highlight.utils.js';
import { logger } from './logger.js';
import type { HighlightSettingService } from './types.js';

// I fully appreciate the irony of using regex to parse regex.
// https://regex101.com/r/J18f91/1
const TYPE_REGEX = /{(?<type>.+?)}/;
const COLOR_REGEX = /{(?<fgColor>.+?)(?:\s*,\s*(?<bgColor>.+?))?}/;
const PATTERN_REGEX = /{(?<pattern>.+?)}/;
const CLASS_REGEX = /{(?<className>.+?)}/;

const SETTING_LINE_REGEX = new RegExp(
  `^#highlight\\s*${TYPE_REGEX.source}\\s*${COLOR_REGEX.source}\\s*${PATTERN_REGEX.source}\\s*(?:${CLASS_REGEX.source})?$`
);

export class HighlightSettingServiceImpl implements HighlightSettingService {
  private settings: Array<HighlightSetting>;

  constructor() {
    this.settings = [];
  }

  public get(): Array<HighlightSetting> {
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
     * #highlight {matchType} {fg[,bg]} {pattern} {class}
     * ```
     * Where `matchType` defines how to match the pattern to the text.
     * Where `fg` is the foreground color, like `#ff0000` or `red`.
     * Where `bg` is the background color, like `#0000ff` or `blue`.
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

    logger.debug('loading highlights file', { filePath, mode });

    if (mode === 'replace') {
      this.clear();
    }

    const parsedSettings = await this.parseFile({ filePath });
    this.settings.push(...parsedSettings);
  }

  protected async parseFile(options: {
    filePath: string;
  }): Promise<Array<HighlightSetting>> {
    const { filePath } = options;

    logger.debug('parsing highlights file', { filePath });

    if (!fs.pathExistsSync(filePath)) {
      logger.debug('highlights file not found, skipping', { filePath });
      return [];
    }

    try {
      const settings = await parseLines<HighlightSetting>({
        readStream: fs.createReadStream(filePath, 'utf8'),
        parse: (line) => this.parseLine({ line }),
      });
      logger.debug('done parsing highlights file', {
        filePath,
        count: settings.length,
      });
      return settings;
    } catch (error) {
      logger.error('error parsing highlights file', {
        filePath,
        error,
      });
      return [];
    }
  }

  /**
   * Syntax:
   * ```
   * #highlight {matchType} {fg[,bg]} {pattern} {class}
   * ```
   *
   * Example:
   * ```
   * #highlight {line} {#FF0000} {are facing a} {combat}
   * #highlight {beginswith} {#FF0000} {You are bleeding} {wounds}
   * #highlight {regexp} {#E65A29} {It requires the ([\w\s]+) skills? to cast effectively.} {spell}
   * ```
   */
  protected parseLine(options: { line: string }): Maybe<HighlightSetting> {
    const { line } = options;

    if (isBlank(line)) {
      return;
    }

    if (!line.startsWith('#highlight')) {
      return;
    }

    const match = SETTING_LINE_REGEX.exec(line.trim());

    if (!match?.groups) {
      return;
    }

    return buildHighlightSetting({
      matchType: match.groups.type,
      pattern: match.groups.pattern,
      foregroundColor: match.groups.fgColor,
      backgroundColor: match.groups.bgColor,
      className: match.groups.className,
    });
  }
}
