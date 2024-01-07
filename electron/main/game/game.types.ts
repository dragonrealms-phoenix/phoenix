import type * as rxjs from 'rxjs';
import type { GameEvent } from '../../common/game';

export interface GameService {
  /**
   * Connect to the game server.
   * Returns an observable that emits game events parsed from raw output.
   * Upon disconnect, the observable will complete and no longer emit values.
   */
  connect(): Promise<rxjs.Observable<GameEvent>>;

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

export interface GameSocket {
  /**
   * Connect to the game server.
   * Returns an observable that emits game server output.
   * Upon disconnect, the observable will complete and no longer emit values.
   *
   * This is a raw data stream that may contain multiple XML tags and text.
   * Each emitted value may contain one or more fully formed XML tags and text.
   * For example, detailing the character's inventory, health, room, etc.
   * It is the caller's responsibility to parse and make sense of the data.
   */
  connect(): Promise<rxjs.Observable<string>>;

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

export interface GameParser {
  /**
   * Parses the game socket stream to emit game events.
   */
  parse(gameSocketStream: rxjs.Observable<string>): rxjs.Observable<GameEvent>;
}
