/**
 * Utilities to check what platform the electron app is running on.
 */

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}
