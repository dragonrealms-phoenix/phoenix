import type { Maybe } from 'common/types';
import fs from 'fs-extra';
import { isBlank } from '../../../common/string/string.utils.js';
import { parseLines } from '../setting.utils.js';
import { logger } from './logger.js';
import {
  HighlightMatchType,
  type HighlightSetting,
  type HighlightSettingService,
} from './types.js';

// I fully appreciate the irony of using regex to parse regex.
// https://regex101.com/r/kxnr6j/1
const TYPE_REGEX = /{(?<type>\w+)}/;
const COLOR_REGEX = /{(?<fgColor>[#\w]+)(?:\s*,\s*(?<bgColor>[#\w]+))?}/;
const PATTERN_REGEX = /{(?<pattern>.+?)}/;
const CLASS_REGEX = /{(?<className>\w+)}/;

const HIGHLIGHT_REGEX = new RegExp(
  `#highlight\\s*${TYPE_REGEX.source}\\s*${COLOR_REGEX.source}\\s*${PATTERN_REGEX.source}\\s*(?:${CLASS_REGEX.source})?$`
);

export class HighlightSettingServiceImpl implements HighlightSettingService {
  private filePath: string;
  private highlights: Array<HighlightSetting>;

  constructor(options: { filePath: string }) {
    this.filePath = options.filePath;
    this.highlights = [];
  }

  public getHighlights(): Array<HighlightSetting> {
    return this.highlights;
  }

  public async load(): Promise<Array<HighlightSetting>> {
    const filePath = this.filePath;
    logger.debug('loading highlights file', { filePath });
    this.highlights = await this.parseFile({ filePath });
    return this.highlights;
  }

  protected async parseFile(options: {
    filePath: string;
  }): Promise<Array<HighlightSetting>> {
    const { filePath } = options;

    logger.debug('parsing highlights file', { filePath });

    if (!fs.pathExistsSync(filePath)) {
      logger.warn('highlights file not found, skipping', { filePath });
      return [];
    }

    try {
      const highlights = await parseLines<HighlightSetting>({
        readStream: fs.createReadStream(this.filePath, 'utf8'),
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

    const match = HIGHLIGHT_REGEX.exec(line.trim());

    if (!match?.groups) {
      return;
    }

    const highlight: HighlightSetting = {
      matchType: this.parseMatchType({ type: match.groups.type }),
      pattern: match.groups.pattern,
      fgColor: match.groups.fgColor,
      bgColor: match.groups.bgColor,
      className: match.groups.className,
    };

    return highlight;
  }

  /**
   * Converts a Genie match type to our enum.
   */
  protected parseMatchType(options: { type: string }): HighlightMatchType {
    const { type } = options;

    let matchType: HighlightMatchType;

    switch (type) {
      case 'line':
      case 'lines':
        matchType = HighlightMatchType.CONTAINS;
        break;
      case 'beginswith':
      case 'startswith':
        matchType = HighlightMatchType.STARTS;
        break;
      case 'regex':
      case 'regexp':
        matchType = HighlightMatchType.REGEX;
        break;
      case 'string':
      case 'strings':
      default:
        matchType = HighlightMatchType.EXACT;
        break;
    }

    return matchType;
  }
}
