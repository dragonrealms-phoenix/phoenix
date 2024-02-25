import path from 'node:path';
import url from 'node:url';

/**
 * Converts a relative file path to an absolute file URL.
 * Example: 'file.txt' -> 'file:///path/to/file.txt'
 */
export const pathToFileURL = (options: {
  /**
   * The directory path to resolve the file path against.
   */
  dirPath: string;
  /**
   * The relative file path to convert to a file URL.
   */
  filePath: string;
}): string => {
  const { dirPath, filePath } = options;
  return url.pathToFileURL(path.join(dirPath, filePath)).toString();
};
