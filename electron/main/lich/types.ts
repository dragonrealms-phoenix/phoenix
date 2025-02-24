/**
 * Lich is a "man-in-the-middle" server that connects to the game server.
 * You connect to this host and port instead of the game server directly.
 */
export interface LichProcessInfo {
  /**
   * The process ID of the Lich process.
   */
  pid?: number;
  /**
   * The host to connect to the Lich process.
   */
  host: string;
  /**
   * The port to connect to the Lich process.
   */
  port: number;
}
