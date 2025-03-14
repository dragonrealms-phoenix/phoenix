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

const HIGHLIGHT_CONFIG_LINE_REGEX = new RegExp(
  `^#highlight\\s*${TYPE_REGEX.source}\\s*${COLOR_REGEX.source}\\s*${PATTERN_REGEX.source}\\s*(?:${CLASS_REGEX.source})?$`
);

export class HighlightSettingServiceImpl implements HighlightSettingService {
  private highlights: Array<HighlightSetting>;

  constructor() {
    this.highlights = [];
  }

  public get(): Array<HighlightSetting> {
    return this.highlights;
  }

  public clear(): void {
    this.highlights = [];
  }

  public async load(options: {
    filePath: string;
    mode?: 'append' | 'replace';
  }): Promise<void> {
    const { filePath, mode = 'append' } = options;

    logger.debug('loading highlights file', { filePath, mode });

    if (mode === 'replace') {
      this.clear();
    }

    const parsedHighlights = await this.parseFile({ filePath });
    this.highlights.push(...parsedHighlights);
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
      const highlights = await parseLines<HighlightSetting>({
        readStream: fs.createReadStream(filePath, 'utf8'),
        parse: (line) => this.parseLine({ line }),
      });
      logger.debug('done parsing highlights file', {
        filePath,
        count: highlights.length,
      });
      return highlights;
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

    const match = HIGHLIGHT_CONFIG_LINE_REGEX.exec(line.trim());

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
