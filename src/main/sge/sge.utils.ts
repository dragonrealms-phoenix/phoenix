/**
 * Heuristic to check if the SGE response indicates a problem.
 * Matches the format `{letter}\tPROBLEM`.
 * Examples: `A\tPROBLEM` or `X\tPROBLEM`.
 */
export const isProblemResponse = (text: string): boolean => {
  const [_, problem] = text.split('\t');
  return problem === 'PROBLEM';
};

/**
 * Hashes a password per the SGE Protocol.
 * Returns buffer of the hashed bytes.
 * Note, the buffer may contain non-UTF8 and non-ASCII characters
 * so don't try encoding them to strings because it'll fail to authenticate.
 * The hashed bytes must be sent as-is to SGE during the authentication step.
 */
export function hashPassword(options: {
  /**
   * Account password to hash before authenticating.
   */
  password: string;
  /**
   * 32 random characters to use as a salt to hasing the password.
   * Obtained from the SGE protocol before authenticating.
   */
  hashSalt: string;
}): Buffer {
  const { password, hashSalt } = options;

  const maxBytesLen = Math.min(password.length, hashSalt.length);

  const hashValueBytes = new Array<number>();
  const passwordBytes = Buffer.from(password);
  const hashSaltBytes = Buffer.from(hashSalt);

  // For each index, do a computation with the bytes from
  // the password and the hash to generate a new, hashed value.
  for (let i = 0; i < maxBytesLen; i++) {
    const hashedByte = ((passwordBytes[i] - 0x20) ^ hashSaltBytes[i]) + 0x20;
    hashValueBytes.push(hashedByte);
  }

  const hashedPassword = Buffer.from(hashValueBytes);

  return hashedPassword;
}
