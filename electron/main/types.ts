/**
 * Emit a message on a channel and pass arbitrary data.
 */
export type Dispatcher = (channel: string, ...args: Array<unknown>) => void;
