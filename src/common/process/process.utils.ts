/**
 * https://www.electronjs.org/docs/latest/api/process#processtype-readonly
 */

export function isMainProcess(): boolean {
  return getProcess()?.type === 'browser';
}

/**
 * In the renderer process with node integration disabled then
 * the `process` implicit variable is not defined and the browser
 * will throw an error if you try to reference it.
 * Therefore, we have to check for its existance before use.
 */
export function getProcess(): NodeJS.Process | undefined {
  return typeof process === 'undefined' ? undefined : process;
}
