import { nextTick } from 'node:process';
import type { Writable } from 'node:stream';
import type {
  LogMessage,
  LogTransporter,
} from '../../../common/logger/types.js';
import type { LogFormatter } from '../types.js';

/**
 * Transports logs via a {@link Writable} stream.
 */
export class WritableLogTransporterImpl implements LogTransporter {
  // To allow for asynchronous writing of logs without the use of promises,
  // we use a recursive-like queue draining algorithm. This provides an
  // ergonomic API while still allowing for asynchronous writing.
  // This also allows us to buffer when we need to wait for the writer to drain.
  private asyncWriteQueue = new Array<LogMessage>();
  private asyncWriteInProgress = false;

  private writer: Writable;
  private formatter?: LogFormatter;

  constructor(options: {
    /**
     * Where to write the log messages.
     */
    writable: Writable;
    /**
     * Optional to format the log messages before writing them.
     */
    formatter?: LogFormatter;
  }) {
    this.formatter = options?.formatter;
    this.writer = options.writable;

    this.writer.on('error', (error) => {
      this.callback(error);
    });
  }

  public transport(message: LogMessage): void {
    // We queue messages to write then process them in the background
    // to allow for asynchronous writing of logs without the use of promises
    // so that the use of our logger doesn't require 'await' everywhere.
    // And to buffer when we need to wait for the writer to drain.
    this.asyncWriteQueue.push(message);

    // If we're already writing, no need to queue up more 'tick' callbacks
    // because at the end of the write we'll check for more messages anyways.
    if (this.asyncWriteInProgress) {
      return;
    }

    // Ensure the log is written asynchronously, but soonish.
    nextTick(() => {
      this.writeNextMessageAsync();
    });
  }

  protected writeNextMessageAsync(): void {
    if (this.asyncWriteInProgress || this.asyncWriteQueue.length === 0) {
      return;
    }

    const message = this.asyncWriteQueue.shift();
    if (!message) {
      this.callback();
      return;
    }

    this.asyncWriteInProgress = true;

    try {
      const formattedMessage = this.formatter?.format(message) ?? message;

      const doDrain = !this.writer.write(formattedMessage);

      if (doDrain) {
        this.writer.once('drain', () => {
          this.callback();
        });
      } else {
        this.callback();
      }
    } catch (error) {
      this.callback(error);
    }
  }

  protected callback(error?: Error | null): void {
    if (error) {
      console.error('[LOGGER:WRITE:ERROR]', error);
    }

    this.asyncWriteInProgress = false;

    // Now check for more messages to write.
    // Using `nextTick` avoids stack overflow when the queue is large.
    nextTick(() => {
      this.writeNextMessageAsync();
    });
  }
}
