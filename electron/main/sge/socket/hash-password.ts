import type tls from 'node:tls';
import { sendAndReceive } from '../../tls/send-and-receive.js';
import { logger } from '../logger.js';

export const hashPassword = async (options: {
  socket: tls.TLSSocket;
  password: string;
}): Promise<Buffer> => {
  const { socket, password } = options;

  // Request salt for hashing the password.
  const hashSalt = await getPasswordHashSalt({ socket });

  // Hash the password to protect it over the wire.
  const hashedPassword = hashPasswordWithSalt({ password, hashSalt });

  return hashedPassword;
};

/**
 * Request salt for hashing the account password.
 * This ensures we don't send the plaintext password over the wire.
 */
export const getPasswordHashSalt = async (options: {
  socket: tls.TLSSocket;
}): Promise<string> => {
  const { socket } = options;

  logger.debug('getting password hash salt');

  /**
   * Send request for password hash salt:
   *  'K'
   *
   * Always get back a successful response.
   * The entire response is the hash salt, usually 32 characters in length.
   */
  const hashSalt = (
    await sendAndReceive({
      socket,
      payload: Buffer.from(`K`),
    })
  ).toString();

  logger.debug('got password hash salt');

  return hashSalt;
};

/**
 * Hashes a password per the SGE Protocol.
 * Returns buffer of the hashed bytes.
 * Note, the buffer may contain non-UTF8 and non-ASCII characters
 * so don't try encoding them to strings because it'll fail to authenticate.
 * The hashed bytes must be sent as-is to SGE during the authentication step.
 */
export const hashPasswordWithSalt = (options: {
  /**
   * Account password to hash before authenticating.
   */
  password: string;
  /**
   * 32 random characters to use as a salt to hasing the password.
   * Obtained from the SGE protocol before authenticating.
   */
  hashSalt: string;
}): Buffer => {
  const { password, hashSalt } = options;

  const maxBytesLen = Math.min(password.length, hashSalt.length);

  const hashValueBytes = new Array<number>();
  const passwordBytes = Buffer.from(password);
  const hashSaltBytes = Buffer.from(hashSalt);

  // For each index, do a computation with the bytes from
  // the password and the hash to generate a new, hashed value.
  for (let i = 0; i < maxBytesLen; i += 1) {
    const hashedByte = ((passwordBytes[i] - 0x20) ^ hashSaltBytes[i]) + 0x20;
    hashValueBytes.push(hashedByte);
  }

  const hashedPassword = Buffer.from(hashValueBytes);

  return hashedPassword;
};
