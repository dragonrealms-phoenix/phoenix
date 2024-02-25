import path from 'node:path';

/**
 * Determine if a file path is safe to serve by
 * ensuring that it is within the directory path.
 * Protects against directory traversal attacks.
 */
export const isSafePath = (options: {
  /**
   * Known safe directory to host files from.
   * Example: '/path/to/directory'
   */
  dirPath: string;
  /**
   * A file path to verify is within the directory.
   * Example: '/path/to/directory/file.txt'
   */
  filePath: string;
}): boolean => {
  const { dirPath, filePath } = options;

  const relativePath = path.relative(dirPath, filePath);

  const isSafe =
    relativePath.length > 0 &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath);

  return isSafe;
};
