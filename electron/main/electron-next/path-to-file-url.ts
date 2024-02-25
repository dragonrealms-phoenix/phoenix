import url from 'node:url';

/**
 * Converts a file path to an absolute file URL.
 * For most reliable results, provide an absolute file path.
 * Example: '/path/to/file.txt' -> 'file:///path/to/file.txt'
 */
export const pathToFileURL = (filePath: string): string => {
  return url.pathToFileURL(filePath).toString();
};
