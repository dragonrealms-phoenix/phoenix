/**
 * https://www.electronjs.org/docs/latest/api/process#processtype-readonly
 */

export function isMainProcess(): boolean {
  return process.type === 'browser';
}
