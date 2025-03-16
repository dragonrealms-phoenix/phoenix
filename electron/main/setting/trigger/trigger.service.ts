import fs from 'fs-extra';
import type { TriggerSetting } from '../../../common/setting/types.js';
import { isBlank } from '../../../common/string/string.utils.js';
import type { Maybe } from '../../../common/types.js';
import { logger } from '../logger.js';
import { parseLines } from '../setting.utils.js';
import { buildTriggerSetting } from './trigger.utils.js';
import type { TriggerSettingService } from './types.js';

// I fully appreciate the irony of using regex to parse regex.
// https://regex101.com/r/TODO
const PATTERN_REGEX = /{(?<pattern>.+?)}/;
const ACTION_REGEX = /{(?<action>.+?)}/;
const CLASS_REGEX = /{(?<className>.+?)}/;

const SETTING_LINE_REGEX = new RegExp(
  `^#trigger\\s*${PATTERN_REGEX.source}\\s*${ACTION_REGEX.source}\\s*(?:${CLASS_REGEX.source})?$`
);

export class TriggerSettingServiceImpl implements TriggerSettingService {
  private settings: Array<TriggerSetting>;

  constructor() {
    this.settings = [];
  }

  public get(): Array<TriggerSetting> {
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
     * #trigger {pattern} {action} {class}
     * ```
     * Where `pattern` is the string or regex pattern to match.
     * Where `action` is a semicolon-delimited list of commands to execute.
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

    logger.debug('loading trigger file', { filePath, mode });

    if (mode === 'replace') {
      this.clear();
    }

    const parsedSettings = await this.parseFile({ filePath });
    this.settings.push(...parsedSettings);
  }

  protected async parseFile(options: {
    filePath: string;
  }): Promise<Array<TriggerSetting>> {
    const { filePath } = options;

    logger.debug('parsing trigger file', { filePath });

    if (!fs.pathExistsSync(filePath)) {
      logger.debug('trigger file not found, skipping', { filePath });
      return [];
    }

    try {
      const settings = await parseLines<TriggerSetting>({
        readStream: fs.createReadStream(filePath, 'utf8'),
        parse: (line) => this.parseLine({ line }),
      });
      logger.debug('done parsing trigger file', {
        filePath,
        count: settings.length,
      });
      return settings;
    } catch (error) {
      logger.error('error parsing trigger file', {
        filePath,
        error,
      });
      return [];
    }
  }

  /**
   * Syntax:
   * ```
   * #trigger {pattern} {action} {class}
   * ```
   *
   * Example:
   * ```
   * #trigger {Last login} {#send 1 sort auto head}
   * #trigger {^Also here:} {#class roomplayers on} {rooms}
   * #trigger {^(System Announcement|Announcement): (.*)$} {#beep;#flash;}
   * ```
   */
  protected parseLine(options: { line: string }): Maybe<TriggerSetting> {
    const { line } = options;

    if (isBlank(line)) {
      return;
    }

    if (!line.startsWith('#trigger')) {
      return;
    }

    const match = SETTING_LINE_REGEX.exec(line.trim());

    if (!match?.groups) {
      return;
    }

    return buildTriggerSetting({
      pattern: match.groups.pattern,
      action: match.groups.action,
      className: match.groups.className,
    });
  }
}
