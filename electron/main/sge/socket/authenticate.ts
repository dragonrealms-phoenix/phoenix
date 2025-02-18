import type tls from 'node:tls';
import last from 'lodash-es/last.js';
import { sendAndReceive } from '../../tls/send-and-receive.js';
import { logger } from '../logger.js';
import { hashPassword } from './hash-password.js';

/**
 * Authenticate to login server.
 */
export const authenticate = async (options: {
  socket: tls.TLSSocket;
  username: string;
  password: string;
}): Promise<void> => {
  const { socket, username, password } = options;

  logger.debug('authenticating', { username });

  // Hash the password to protect it over the wire
  const hashedPassword = await hashPassword({ socket, password });

  /**
   * Send account username and hashed password:
   *  'A\t{username}\t{hashed_password}'
   *
   * A succesful response has the format:
   *  'A\t{username}\tKEY\t{key}\t...'
   *
   * An unsuccessful response has the format:
   *  'A\t\tPASSWORD', 'A\t\tNORECORD' or '?'
   */
  const response = (
    await sendAndReceive({
      socket,
      payload: Buffer.concat([
        Buffer.from(`A\t${username.toUpperCase()}\t`),
        hashedPassword,
      ]),
    })
  ).toString();

  if (!response.includes('\tKEY\t')) {
    const authError = parseAuthError(response);
    logger.error('authentication failed', { authError });
    throw new Error(`[SGE:LOGIN:ERROR:AUTH] ${username} ${authError}`);
  }

  logger.debug('authenticated', { username });
};

const parseAuthError = (text: string): string => {
  if (text.startsWith('A')) {
    return last(text.split('\t')) as string;
  }
  return text;
};
