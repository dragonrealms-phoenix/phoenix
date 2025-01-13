import type { LogData, Logger } from './types.js';
import { LogLevel } from './types.js';

export abstract class AbstractLogger implements Logger {
  public error(message: string, data?: LogData): void {
    this.log({ level: LogLevel.ERROR, message, data });
  }

  public warn(message: string, data?: LogData): void {
    this.log({ level: LogLevel.WARN, message, data });
  }

  public info(message: string, data?: LogData): void {
    this.log({ level: LogLevel.INFO, message, data });
  }

  public debug(message: string, data?: LogData): void {
    this.log({ level: LogLevel.DEBUG, message, data });
  }

  public trace(message: string, data?: LogData): void {
    this.log({ level: LogLevel.TRACE, message, data });
  }

  public abstract log(options: {
    level: LogLevel;
    message: string;
    data?: LogData;
  }): void;
}
