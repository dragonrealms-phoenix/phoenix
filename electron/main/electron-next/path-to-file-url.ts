import path from 'node:path';
import url from 'node:url';

/**
 * Converts a file path to an absolute file URL.
 * Example: '/path/to/file.txt' -> 'file:///path/to/file.txt'
 */
export const pathToFileURL = (options: {
  dirPath: string;
  filePath: string;
}): string => {
  const { dirPath, filePath } = options;
  return url.pathToFileURL(path.join(dirPath, filePath)).toString();
};
