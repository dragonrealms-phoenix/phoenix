import { nextTick } from 'node:process';
import { AbstractLogger } from './abstract-logger.js';
import { isLogLevelEnabled } from './logger.utils.js';
import type {
  LogData,
  LogFormatter,
  LogLevel,
  LogMessage,
  LogTransport,
} from './types.js';

const DEFAULT_SCOPE = 'default';
const DEFAULT_TRANSPORT: LogTransport = process.stdout;
const DEFAULT_FORMATTER: LogFormatter = (data) => JSON.stringify(data);

/**
 * Originally, I used the `electron-log` module (https://github.com/megahertz/electron-log)
 * but at some point it stopped writing logs from renderer to a file.
 * Possibly related to https://github.com/megahertz/electron-log/issues/441.
 * After multiple attempts to fix it, I decided to implement my own logger.
 */
export class LoggerImpl extends AbstractLogger {
  // To allow for asynchronous writing of logs without the use of promises
  // we use a recursive-like queue draining algorithm. This provides an
  // ergonomic API while still allowing for asynchronous writing.
  private asyncWriteQueue = new Array<LogMessage>();
  private asyncWriteInProgress = false;
  private asyncCountdownLatch = 0;

  private scope: string;

  private transports: Array<{
    transport: LogTransport;
    formatter: LogFormatter;
    level?: LogLevel;
  }>;

  constructor(options: {
    scope?: string;
    transports?: Array<{
      transport: LogTransport;
      formatter: LogFormatter;
      level?: LogLevel;
    }>;
  }) {
    super();

    this.scope = options.scope ?? DEFAULT_SCOPE;

    this.transports = options.transports ?? [
      {
        transport: DEFAULT_TRANSPORT,
        formatter: DEFAULT_FORMATTER,
      },
    ];

    this.transports.forEach(({ transport }) => {
      this.addTransportErrorListener(transport);
    });
  }

  public override log(options: {
    level: LogLevel;
    message: string;
    data?: LogData;
  }): void {
    const { level, message, data } = options;

    if (!isLogLevelEnabled(level)) {
      return;
    }

    // We queue messages to write then process them in the background
    // to allow for asynchronous writing of logs without the use of promises
    // so that the use of our logger doesn't require 'await' everywhere.
    this.asyncWriteQueue.push({
      level,
      message,
      scope: this.scope,
      timestamp: new Date(),
      ...data,
    });

    // Ensure the log is written asynchronously, but soonish.
    // This is to avoid blocking the main thread for too long.
    nextTick(() => {
      this.writeLogAsync();
    });
  }

  /**
   * If the logger is currently writing to transports, then this does nothing.
   * Otherwise, it writes the queued messages to each transport.
   * It rechecks the queue once all transports have been written to.
   */
  protected writeLogAsync(): void {
    if (this.asyncWriteInProgress || this.asyncWriteQueue.length === 0) {
      return;
    }

    // Drain the message queue at this point in time.
    // As we write to each transport, any new messages will be queued.
    // Once we've written to all transports, we recheck the queue.
    const messagesToLog = [...this.asyncWriteQueue];
    this.asyncWriteQueue = [];
    this.asyncWriteInProgress = true;
    this.asyncCountdownLatch = this.transports.length;

    for (const { transport, formatter, level } of this.transports) {
      try {
        // If a transport is destroyed or otherwise unusable, skip it.
        // This can occur if the transport has been closed or errored.
        if (!this.isTransportWritable(transport)) {
          this.doneWithTransportCallback();
          continue;
        }

        // If a transport does not support the log level, skip it.
        if (!this.isTransportLogLevelSupported(level)) {
          this.doneWithTransportCallback();
          continue;
        }

        const textToWrite = formatter(messagesToLog);

        // If the write operation returns false then its internal buffer
        // is nearing capacity and we should wait for the 'drain' event.
        // The write occurred but this signals we should slow down.
        const doDrain = !transport.write(textToWrite, 'utf8');

        if (doDrain) {
          transport.once('drain', () => {
            this.doneWithTransportCallback();
          });
        } else {
          this.doneWithTransportCallback();
        }
      } catch (error) {
        this.doneWithTransportCallback(error);
      }
    }
  }

  protected isTransportWritable(transport: LogTransport): boolean {
    return transport.writable;
  }

  protected isTransportLogLevelSupported(level?: LogLevel): boolean {
    return !level || isLogLevelEnabled(level);
  }

  protected addTransportErrorListener(transport: LogTransport): void {
    transport.on('error', (error) => {
      this.doneWithTransportCallback(error);
    });
  }

  protected doneWithTransportCallback(error?: Error | null): void {
    if (error) {
      console.error('[LOGGER:WRITE:ERROR]', error);
    }

    // Mitigate when we've already written to each transport
    // but the callback is invoked due to a delayed error event.
    if (this.asyncCountdownLatch <= 0) {
      return;
    }

    this.asyncCountdownLatch -= 1;

    if (this.asyncCountdownLatch <= 0) {
      this.asyncWriteInProgress = false;
      nextTick(() => {
        this.writeLogAsync();
      });
    }
  }
}
