import type { Observable } from 'rxjs';

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

export interface GameSocket {
  /**
   * Connect to the game server.
   * Returns an observable that emits game server output.
   * Upon disconnect, the observable will complete and no longer emit values.
   *
   * This is a raw data stream that may contain multiple XML tags.
   * Each emitted value contains one or more fully formed XML tags.
   * For example, detailing the character's inventory, health, room, etc.
   * It is the caller's responsibility to parse and make sense of the data.
   */
  connect(): Promise<Observable<string>>;

  /**
   * Disconnect from the game server.
   * Does nothing if already disconnected.
   */
  disconnect(): Promise<void>;

  /**
   * Send a command to the game server.
   * Throws error if not connected.
   * https://elanthipedia.play.net/Category:Commands
   */
  send(command: string): void;
}
