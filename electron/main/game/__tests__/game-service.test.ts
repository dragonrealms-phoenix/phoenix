import * as rxjs from 'rxjs';
import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type GameEvent, GameEventType } from '../../../common/game/types.js';
import { GameServiceImpl } from '../game.service.js';
import type { GameParser, GameService, GameSocket } from '../types.js';

const { mockParser, mockSocket } = vi.hoisted(() => {
  const mockParser: Mocked<GameParser> = {
    parse: vi.fn(),
  };

  const mockSocket: Mocked<GameSocket> = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
  };

  return {
    mockParser,
    mockSocket,
  };
});

vi.mock('../game.parser.js', () => {
  class GameParserMockImpl implements GameParser {
    parse = vi
      .fn()
      .mockImplementation(async (gameSocketStream: rxjs.Observable<string>) => {
        return mockParser.parse(gameSocketStream);
      });
  }

  return {
    GameParserImpl: GameParserMockImpl,
  };
});

vi.mock('../game.socket.js', () => {
  class GameSocketMockImpl implements GameSocket {
    private onConnect;
    private onDisconnect;

    constructor(options: {
      onConnect?: () => void;
      onDisconnect?: (
        event: 'end' | 'close' | 'timeout' | 'error',
        error?: Error
      ) => void;
    }) {
      this.onConnect = options.onConnect;
      this.onDisconnect = options.onDisconnect;
    }

    connect = vi.fn().mockImplementation(async () => {
      this.onConnect?.();
      return mockSocket.connect();
    });

    disconnect = vi.fn().mockImplementation(async () => {
      this.onDisconnect?.('end');
      this.onDisconnect?.('close');
      return mockSocket.disconnect();
    });

    send = vi.fn().mockImplementation((command: string) => {
      return mockSocket.send(command);
    });
  }

  return {
    GameSocketImpl: GameSocketMockImpl,
  };
});

describe('game-service', () => {
  let gameService: GameServiceImpl;

  /**
   * Helper function to ensure any pending timers are executed.
   */
  const connectGameService: GameService['connect'] = async () => {
    const promise = gameService.connect();
    await vi.runOnlyPendingTimersAsync();
    return promise;
  };

  /**
   * Helper function to ensure any pending timers are executed.
   * For example, when the disconnect event performs a "wait for" condition.
   */
  const disconnectGameService: GameService['disconnect'] = async () => {
    const promise = gameService.disconnect();
    await vi.runOnlyPendingTimersAsync();
    return promise;
  };

  beforeEach(() => {
    gameService = new GameServiceImpl({
      credentials: {
        accessToken: 'test-access-token',
        host: 'test-host',
        port: 1234,
      },
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#connect', () => {
    let mockSocketData$: rxjs.Observable<string>;
    let mockEvent: GameEvent;

    beforeEach(() => {
      mockSocketData$ = rxjs.of('test message');
      mockSocket.connect.mockResolvedValue(mockSocketData$);

      mockEvent = {
        eventId: 'test-event-1',
        type: GameEventType.TEXT,
        text: 'test message',
      };
      mockParser.parse.mockResolvedValue(rxjs.of(mockEvent));
    });

    it('connects to the game server', async () => {
      const gameEvents$ = await connectGameService();

      // This is first connection, so does not disconnect previous socket.
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(0);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);

      // Parser is called with the socket data.
      expect(mockParser.parse).toHaveBeenCalledTimes(1);
      expect(mockParser.parse).toHaveBeenCalledWith(mockSocketData$);

      const gameEvent = await rxjs.firstValueFrom(gameEvents$);
      expect(gameEvent).toEqual(mockEvent);
    });

    it('disconnects previous connection', async () => {
      await connectGameService();

      expect(mockSocket.disconnect).toHaveBeenCalledTimes(0);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);

      // Connect again, should disconnect previous connection.
      await connectGameService();

      // Previous connection is disconnected.
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
      expect(mockSocket.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe('#disconnect', () => {
    it('disconnects from the game server', async () => {
      await connectGameService();
      await disconnectGameService();

      expect(mockSocket.connect).toHaveBeenCalledTimes(1);
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });

    it('does not disconnect if already destroyed', async () => {
      await disconnectGameService();
      await disconnectGameService();

      expect(mockSocket.connect).toHaveBeenCalledTimes(0);
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
