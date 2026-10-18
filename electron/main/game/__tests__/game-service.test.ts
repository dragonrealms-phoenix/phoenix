import path from 'node:path';
import * as rxjs from 'rxjs';
import type { Mocked } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameEventType } from '../../../common/game/types.js';
import type { GameEvent } from '../../../common/game/types.js';
import { clearLogLevelCache } from '../../logger/logger.utils.js';
import { GameServiceImpl } from '../game.service.js';
import type { GameParser, GameSocket } from '../types.js';

const {
  mockParser,
  mockSocket,
  mockSocketLogStream,
  mockEventLogStream,
  mockCreateWriteStream,
  mockWaitUntil,
} = vi.hoisted(() => {
  // For mocking the game parser module.
  const mockParser: Mocked<GameParser> = {
    parse: vi.fn<GameParser['parse']>(),
  };

  // For mocking the game socket module.
  const mockSocket: Mocked<GameSocket> = {
    isConnected: vi.fn<GameSocket['isConnected']>(),
    connect: vi.fn<GameSocket['connect']>(),
    disconnect: vi.fn<GameSocket['disconnect']>(),
    send: vi.fn<GameSocket['send']>(),
  };

  // For mocking the socket log stream.
  const mockSocketLogStream = {
    write: vi.fn(),
    end: vi.fn(),
  };

  // For mocking the event log stream.
  const mockEventLogStream = {
    write: vi.fn(),
    end: vi.fn(),
  };

  // For mocking the creation of write streams.
  const mockCreateWriteStream = vi.fn();

  // When game service disconnects, it waits until the socket is destroyed.
  // This lets us mock if the function resolves or not (i.e. times out).
  const mockWaitUntil = vi.fn();

  return {
    mockParser,
    mockSocket,
    mockSocketLogStream,
    mockEventLogStream,
    mockCreateWriteStream,
    mockWaitUntil,
  };
});

vi.mock('../game.parser.js', () => {
  class GameParserMockImpl implements GameParser {
    parse = vi
      .fn()
      .mockImplementation(
        (
          gameSocketStream: rxjs.Observable<string>
        ): rxjs.Observable<GameEvent> => {
          return mockParser.parse(gameSocketStream);
        }
      );
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

    isConnected = vi.fn().mockImplementation(() => {
      return mockSocket.isConnected();
    });

    connect = vi
      .fn()
      .mockImplementation(async (): Promise<rxjs.Observable<string>> => {
        this.onConnect?.();
        return mockSocket.connect();
      });

    disconnect = vi.fn().mockImplementation(async (): Promise<void> => {
      this.onDisconnect?.('end');
      this.onDisconnect?.('close');
      return mockSocket.disconnect();
    });

    send = vi.fn().mockImplementation((command: string): void => {
      mockSocket.send(command);
    });
  }

  return {
    GameSocketImpl: GameSocketMockImpl,
  };
});

vi.mock('electron', async () => {
  return {
    app: {
      getPath: vi.fn().mockReturnValue('logs'),
    },
  };
});

vi.mock('fs-extra', () => {
  return {
    default: {
      createWriteStream: mockCreateWriteStream,
    },
  };
});

vi.mock('../../../common/async/async.utils.js', () => {
  return {
    waitUntil: mockWaitUntil,
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('game-service', () => {
  let gameService: GameServiceImpl;
  let mockSocketData$: rxjs.Observable<string>;
  let mockEvent: GameEvent;

  beforeEach(() => {
    clearLogLevelCache();
    vi.stubEnv('LOG_LEVEL', 'warn');

    mockSocketData$ = rxjs.of('test message');

    mockSocket.connect.mockReset().mockResolvedValue(mockSocketData$);

    mockEvent = {
      eventId: 'test-event-1',
      type: GameEventType.TEXT,
      text: 'test message',
    };

    mockParser.parse.mockReset().mockReturnValue(rxjs.of(mockEvent));

    mockWaitUntil.mockReset().mockResolvedValue(true);

    mockCreateWriteStream.mockReset().mockImplementation((filePath: string) => {
      if (filePath === path.join('logs', 'game-event.log')) {
        return mockEventLogStream;
      }
      return mockSocketLogStream;
    });

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
    clearLogLevelCache();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#connect', () => {
    it('connects to the game server', async () => {
      const gameEvents$ = await gameService.connect();

      // This is first connection, so does not disconnect previous socket.
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(0);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);

      // Parser is called with the socket data.
      expect(mockParser.parse).toHaveBeenCalledTimes(1);
      expect(mockParser.parse).toHaveBeenCalledWith(mockSocketData$);

      const gameEvent = await rxjs.firstValueFrom(gameEvents$);
      expect(gameEvent).toEqual(mockEvent);

      expect(gameService.isConnected()).toBe(true);
    });

    it('disconnects previous connection', async () => {
      mockWaitUntil.mockResolvedValueOnce(true);

      await gameService.connect();

      expect(mockSocket.disconnect).toHaveBeenCalledTimes(0);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);

      // Connect again, should disconnect previous connection.
      await gameService.connect();

      // Previous connection is disconnected.
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
      expect(mockSocket.connect).toHaveBeenCalledTimes(2);
    });

    it.each(['debug', 'trace'])(
      'logs socket data and events when log level is %s',
      async (logLevel) => {
        vi.stubEnv('LOG_LEVEL', logLevel);

        await gameService.connect();

        expect(mockCreateWriteStream).toHaveBeenCalledTimes(2);
        expect(mockCreateWriteStream).toHaveBeenCalledWith(
          path.join('logs', 'game-socket.log'),
          { encoding: 'utf8', flags: 'w' }
        );
        expect(mockCreateWriteStream).toHaveBeenCalledWith(
          path.join('logs', 'game-event.log'),
          { encoding: 'utf8', flags: 'w' }
        );

        expect(mockSocketLogStream.write).toHaveBeenCalledExactlyOnceWith(
          '---\ntest message\n'
        );

        expect(mockEventLogStream.write).toHaveBeenCalledExactlyOnceWith(
          `---\n${JSON.stringify(mockEvent, null, 2)}`
        );

        // Our mock event log stream has one event so we expect
        // it to complete after writing the event and thus end the stream.
        expect(mockSocketLogStream.end).not.toHaveBeenCalled();
        expect(mockEventLogStream.end).toHaveBeenCalledOnce();

        gameService.send('look');

        expect(mockSocketLogStream.write).toHaveBeenLastCalledWith(
          '---\nlook\n'
        );

        await gameService.disconnect();

        expect(mockSocketLogStream.end).toHaveBeenCalledOnce();
        expect(mockEventLogStream.end).toHaveBeenCalledOnce();
      }
    );

    it('logs only socket data when log level is info', async () => {
      vi.stubEnv('LOG_LEVEL', 'info');

      await gameService.connect();

      expect(mockCreateWriteStream).toHaveBeenCalledExactlyOnceWith(
        path.join('logs', 'game-socket.log'),
        { encoding: 'utf8', flags: 'w' }
      );

      expect(mockSocketLogStream.write).toHaveBeenCalledExactlyOnceWith(
        '---\ntest message\n'
      );

      expect(mockEventLogStream.write).not.toHaveBeenCalled();
      expect(mockSocketLogStream.end).not.toHaveBeenCalled();

      await gameService.disconnect();

      expect(mockSocketLogStream.end).toHaveBeenCalledOnce();
      expect(mockEventLogStream.end).not.toHaveBeenCalled();
    });

    it.each(['warn', 'error'])(
      'does not create log streams when log level is %s',
      async (logLevel) => {
        vi.stubEnv('LOG_LEVEL', logLevel);

        await gameService.connect();

        expect(mockCreateWriteStream).not.toHaveBeenCalled();
        expect(mockSocketLogStream.write).not.toHaveBeenCalled();
        expect(mockEventLogStream.write).not.toHaveBeenCalled();

        await gameService.disconnect();

        expect(mockSocketLogStream.end).not.toHaveBeenCalled();
        expect(mockEventLogStream.end).not.toHaveBeenCalled();
      }
    );
  });

  describe('#disconnect', () => {
    it('disconnects from the game server', async () => {
      mockWaitUntil.mockResolvedValueOnce(true);

      await gameService.connect();
      await gameService.disconnect();

      expect(mockSocket.connect).toHaveBeenCalledTimes(1);
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);

      expect(gameService.isConnected()).toBe(false);
    });

    it('does not disconnect if already destroyed', async () => {
      mockWaitUntil.mockResolvedValueOnce(true);

      await gameService.disconnect();
      await gameService.disconnect();

      expect(mockSocket.connect).toHaveBeenCalledTimes(0);
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });

    it('throws timeout error if does not destroy socket', async () => {
      mockWaitUntil.mockResolvedValueOnce(false);

      await gameService.connect();

      await expect(gameService.disconnect()).rejects.toThrow(
        new Error('[GAME:SERVICE:DISCONNECT:TIMEOUT] 5000')
      );
    });
  });

  describe('#send', () => {
    it('sends command to the game server', async () => {
      await gameService.connect();

      gameService.send('test-command');

      expect(mockSocket.send).toHaveBeenCalledTimes(1);
      expect(mockSocket.send).toHaveBeenCalledWith('test-command');
    });

    it('does not send command if not connected', async () => {
      gameService.send('test-command');

      expect(mockSocket.send).toHaveBeenCalledTimes(0);
    });
  });
});
