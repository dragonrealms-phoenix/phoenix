import type tls from 'node:tls';
import { toUpperSnakeCase } from '../../common/string/string.utils.js';
import type { Maybe } from '../../common/types.js';

/**
 * Sends a command then returns the next response received.
 * Useful when performing a call-response protocol handshake.
 *
 * Note, for the SGE login protocol, we must send and receive binary data
 * to avoid encoding issues with conversions of bytes => strings => bytes.
 */
export const sendAndReceive = async (options: {
  socket: tls.TLSSocket;
  payload: Buffer;
  /**
   * The number of milliseconds to wait for a response before timing out.
   * Default is the socket's timeout value.
   */
  requestTimeout?: number;
}): Promise<Buffer> => {
  const { socket, payload } = options;
  const socketTimeout = socket.timeout;
  const requestTimeout = options.requestTimeout ?? socketTimeout;

  return new Promise<Buffer>((resolve, reject): void => {
    let requestTimeoutId: Maybe<NodeJS.Timeout>;

    const dataListener = (response: Buffer): void => {
      resolveSocket(response);
    };

    const closedListener = (): void => {
      rejectSocket(new Error(`[TLS:SOCKET:STATUS:CLOSED]`));
    };

    const timeoutListener = (): void => {
      rejectSocket(new Error(`[TLS:SOCKET:STATUS:TIMEOUT] ${socketTimeout}`));
    };

    const errorListener = (error: Error): void => {
      rejectSocket(
        new Error(
          `[TLS:SOCKET:ERROR:${toUpperSnakeCase(error.name)}] ${error.message}`
        )
      );
    };

    const addListeners = (): void => {
      socket.once('data', dataListener);
      socket.once('end', closedListener);
      socket.once('close', closedListener);
      socket.once('timeout', timeoutListener);
      socket.once('error', errorListener);
    };

    const removeListeners = (): void => {
      socket.off('data', dataListener);
      socket.off('end', closedListener);
      socket.off('close', closedListener);
      socket.off('timeout', timeoutListener);
      socket.off('error', errorListener);
    };

    const resolveSocket = (response: Buffer): void => {
      clearTimeout(requestTimeoutId);
      removeListeners();
      resolve(response);
    };

    const rejectSocket = (error: Error): void => {
      clearTimeout(requestTimeoutId);
      removeListeners();
      reject(error);
    };

    addListeners();

    if (requestTimeout) {
      requestTimeoutId = setTimeout(() => {
        rejectSocket(
          new Error(`[TLS:SOCKET:REQUEST:TIMEOUT] ${requestTimeout}`)
        );
      }, requestTimeout);
    }

    socket.write(payload);
  });
};
