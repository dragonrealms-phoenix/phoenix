export interface GameService {
  /**
   * Connect to the game server.
   * Does nothing and returns false if has already connected once.
   * Does not support 'connect => disconnect => connect' flow.
   * To reconnect, you must create a new game service instance.
   */
  connect(): Promise<boolean>;

  /**
   * Disconnect from the game server.
   * Does nothing if already disconnected.
   * Always returns true.
   */
  disconnect(): Promise<void>;

  /**
   * Send a command to the game server.
   * https://elanthipedia.play.net/Category:Commands
   */
  send(command: string): void;
}
