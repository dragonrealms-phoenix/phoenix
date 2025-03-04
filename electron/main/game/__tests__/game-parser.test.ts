import * as rxjs from 'rxjs';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GameEvent,
  GameEventType,
  IndicatorType,
} from '../../../common/game/types.js';
import { PreferenceKey } from '../../preference/types.js';
import { GameParserImpl } from '../game.parser.js';
import type { GameParser } from '../types.js';

const { mockPreferenceService } = await vi.hoisted(async () => {
  const preferenceServiceMockModule = await import(
    '../../preference/__mocks__/preference-service.mock.js'
  );

  const mockPreferenceService =
    new preferenceServiceMockModule.PreferenceServiceMockImpl();

  return {
    mockPreferenceService,
  };
});

vi.mock('../../preference/preference.instance.js', async () => {
  return {
    Preferences: mockPreferenceService,
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('game-parser', () => {
  let gameSocketSubject$: rxjs.Subject<string>;
  let gameSocketStream$: rxjs.Observable<string>;
  let gameEventStream$: rxjs.Observable<GameEvent>;

  let onNextSpy: Mock;
  let onCompleteSpy: Mock;
  let onErrorSpy: Mock;

  let parser: GameParser;

  beforeEach(() => {
    gameSocketSubject$ = new rxjs.Subject<string>();
    gameSocketStream$ = gameSocketSubject$.asObservable();

    parser = new GameParserImpl();
    gameEventStream$ = parser.parse(gameSocketStream$);

    onNextSpy = vi.fn();
    onCompleteSpy = vi.fn();
    onErrorSpy = vi.fn();

    gameEventStream$.subscribe({
      next: onNextSpy,
      complete: onCompleteSpy,
      error: onErrorSpy,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  const expectGameEvent = (expected: Partial<GameEvent>) => {
    expect(onNextSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: expect.any(String),
        ...expected,
      })
    );
  };

  describe('#parse', () => {
    it('completes when the socket stream completes', () => {
      gameSocketSubject$.complete();

      expect(onCompleteSpy).toHaveBeenCalled();
    });

    it('errors when the socket stream errors', () => {
      gameSocketSubject$.error(new Error('test'));

      expect(onErrorSpy).toHaveBeenCalledWith(new Error('test'));
    });

    it('errors when the socket stream emits an invalid event', () => {
      gameSocketSubject$.next('<invalid_start_tag');

      expect(onErrorSpy).toHaveBeenCalledWith(
        new Error('[GAME:PARSER:UNPARSED:LINE] <invalid_start_tag')
      );
    });

    it('parses multiple lines into separate events', () => {
      gameSocketSubject$.next('test1\ntest2\ntest3\n');

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `test1\n`,
      });

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `test2\n`,
      });

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `test3\n`,
      });
    });

    it('emits TextGameEvent (plain)', () => {
      gameSocketSubject$.next('test\n');

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `test\n`,
      });
    });

    it('emits TextGameEvent (prompt)', () => {
      gameSocketSubject$.next('<prompt time="1703804031">&gt;</prompt>\n');

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `>\n`,
      });
    });

    it('emits TextGameEvent (prompt preference)', () => {
      mockPreferenceService.get.mockImplementation((key) => {
        switch (key) {
          case PreferenceKey.GAME_WINDOW_PROMPT:
            return '#';
        }
      });

      // Because the preference is read only once when
      // the parser is created, we need to create a new
      // parser so that it picks up the mocked value.

      gameSocketSubject$ = new rxjs.Subject<string>();

      parser = new GameParserImpl();

      gameEventStream$ = parser.parse(gameSocketSubject$.asObservable());

      gameEventStream$.subscribe({
        next: onNextSpy,
        complete: onCompleteSpy,
        error: onErrorSpy,
      });

      gameSocketSubject$.next('<prompt time="1703804031">&gt;</prompt>\n');

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `${mockPreferenceService.get(PreferenceKey.GAME_WINDOW_PROMPT)}\n`,
      });
    });

    it('emits TextGameEvent (with bold tags)', () => {
      gameSocketSubject$.next(
        'You also see <pushBold/>a town guard<popBold/>.\n'
      );

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `You also see <b>a town guard</b>.\n`,
      });
    });

    it('emits TextGameEvent (anchor link text)', () => {
      gameSocketSubject$.next(
        'Visit the <a href="https://play.net/dr">DragonRealms</a> website.\n'
      );

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `Visit the <a href="https://play.net/dr" target="_blank">DragonRealms</a> website.\n`,
      });
    });

    it('emits TextGameEvent (preset tag | room desc)', () => {
      gameSocketSubject$.next(
        '<preset id="roomDesc">A neat row of barred windows...</preset>\n'
      );

      expectGameEvent({
        type: GameEventType.TEXT,
        text: 'A neat row of barred windows...\n',
      });
    });

    it('emits PushBoldGameEvent', () => {
      gameSocketSubject$.next('<pushBold/>\n');

      expectGameEvent({
        type: GameEventType.PUSH_BOLD,
      });
    });

    it('emits PopBoldGameEvent', () => {
      gameSocketSubject$.next('<popBold/>\n');

      expectGameEvent({
        type: GameEventType.POP_BOLD,
      });
    });

    it('emits TextOutputClassGameEvent (mono)', () => {
      gameSocketSubject$.next('<output class="mono"/>\n');

      expectGameEvent({
        type: GameEventType.TEXT_OUTPUT_CLASS,
        textOutputClass: 'mono',
      });
    });

    it('emits TextOutputClassGameEvent (blank)', () => {
      gameSocketSubject$.next('<output class=""/>\n');

      expectGameEvent({
        type: GameEventType.TEXT_OUTPUT_CLASS,
        textOutputClass: '',
      });
    });

    it('emits TextStylePresetGameEvent (style tag | room name)', () => {
      gameSocketSubject$.next('<style id="roomName">\n');

      expectGameEvent({
        type: GameEventType.TEXT_STYLE_PRESET,
        textStylePreset: 'roomName',
      });
    });

    it('emits TextStylePresetGameEvent (preset tag | room name)', () => {
      gameSocketSubject$.next('<preset id="roomName"/>\n');

      expectGameEvent({
        type: GameEventType.TEXT_STYLE_PRESET,
        textStylePreset: 'roomName',
      });
    });

    it('emits IndicatorGameEvent (visible)', () => {
      gameSocketSubject$.next('<indicator id="IconBLEEDING" visible="y"/>\n');

      expectGameEvent({
        type: GameEventType.INDICATOR,
        indicator: IndicatorType.BLEEDING,
        active: true,
      });
    });

    it('emits IndicatorGameEvent (not visible)', () => {
      gameSocketSubject$.next('<indicator id="IconBLEEDING" visible="n"/>\n');

      expectGameEvent({
        type: GameEventType.INDICATOR,
        indicator: IndicatorType.BLEEDING,
        active: false,
      });
    });

    it('emits SpellGameEvent', () => {
      gameSocketSubject$.next('<spell>Fire Shards</spell>\n');

      expectGameEvent({
        type: GameEventType.SPELL,
        spell: 'Fire Shards',
      });
    });

    it('emits HandGameEvent (left)', () => {
      gameSocketSubject$.next('<left>Empty</left>\n');

      expectGameEvent({
        type: GameEventType.LEFT_HAND,
        item: 'Empty',
      });
    });

    it('emits HandGameEvent (right)', () => {
      gameSocketSubject$.next('<right>red backpack</right>\n');

      expectGameEvent({
        type: GameEventType.RIGHT_HAND,
        item: 'red backpack',
      });
    });

    it('emits ClearStreamGameEvent', () => {
      gameSocketSubject$.next('<clearStream id="inv"/>\n');

      expectGameEvent({
        type: GameEventType.CLEAR_STREAM,
        streamId: 'inv',
      });
    });

    it('emits ClearStreamGameEvent for main stream', () => {
      gameSocketSubject$.next('<clearStream id=""/>\n');

      expectGameEvent({
        type: GameEventType.CLEAR_STREAM,
        streamId: 'main',
      });
    });

    it('emits PushStreamGameEvent', () => {
      gameSocketSubject$.next('<pushStream id="experience"/>\n');

      expectGameEvent({
        type: GameEventType.PUSH_STREAM,
        streamId: 'experience',
      });
    });

    it('emits PushStreamGameEvent for main stream', () => {
      gameSocketSubject$.next('<pushStream id=""/>\n');

      expectGameEvent({
        type: GameEventType.PUSH_STREAM,
        streamId: 'main',
      });
    });

    it('emits PopStreamGameEvent', () => {
      gameSocketSubject$.next('<popStream/>\n');

      expectGameEvent({
        type: GameEventType.POP_STREAM,
      });
    });

    it('emits CompassGameEvent', () => {
      gameSocketSubject$.next(
        '<compass><dir value="e"/><dir value="sw"/><dir value="out"/></compass>\n'
      );

      expectGameEvent({
        type: GameEventType.COMPASS,
        directions: ['e', 'sw', 'out'],
      });
    });

    it('emits VitalsGameEvent', () => {
      gameSocketSubject$.next('<progressBar id="health" value="100"/>\n');

      expectGameEvent({
        type: GameEventType.VITALS,
        vitalId: 'health',
        value: 100,
      });
    });

    it('emits ExperienceGameEvent (component wrapping preset)', () => {
      gameSocketSubject$.next(
        '<component id="exp Attunement"><preset id="whisper">Attunement: 1 46% attentive</preset></component>\n'
      );

      expectGameEvent({
        type: GameEventType.EXPERIENCE,
        skill: 'Attunement',
        mindState: 'attentive',
        rank: 1,
        percent: 46,
      });
    });

    it('emits ExperienceGameEvent (component only)', () => {
      gameSocketSubject$.next(
        '<component id="exp Attunement">Attunement: 1 46% attentive</component>\n'
      );

      expectGameEvent({
        type: GameEventType.EXPERIENCE,
        skill: 'Attunement',
        mindState: 'attentive',
        rank: 1,
        percent: 46,
      });
    });

    it('emits ExperienceGameEvent (component only | empty)', () => {
      gameSocketSubject$.next('<component id="exp Attunement"></component>\n');

      expectGameEvent({
        type: GameEventType.EXPERIENCE,
        skill: 'Attunement',
        mindState: 'clear',
        rank: 0,
        percent: 0,
      });
    });

    it('emits RoomGameEvent (room title)', () => {
      gameSocketSubject$.next(
        '<streamWindow id="room" subtitle=" - [Provincial Bank, Teller]" />\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomName: '[Provincial Bank, Teller]',
      });
    });

    it('emits RoomGameEvent (room description)', () => {
      gameSocketSubject$.next(
        '<component id="room desc">A neat row of barred windows...</component>\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomDescription: 'A neat row of barred windows...',
      });
    });

    it('emits RoomGameEvent (room objects)', () => {
      gameSocketSubject$.next(
        '<component id="room objects">You also see a small calendar...</component>\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomObjects: 'You also see a small calendar...',
      });
    });

    it('emits RoomGameEvent (room objs)', () => {
      gameSocketSubject$.next(
        '<component id="room objs">You also see a small calendar...</component>\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomObjects: 'You also see a small calendar...',
      });
    });

    it('emits RoomGameEvent (room players)', () => {
      gameSocketSubject$.next(
        '<component id="room players">Also here: Katoak.</component>\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomPlayers: 'Also here: Katoak.',
      });
    });

    it('emits RoomGameEvent (room exits)', () => {
      gameSocketSubject$.next(
        '<component id="room exits">Obvious exits: <d>out</d>.<compass></compass></component></component>\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomExits: 'Obvious exits: out.',
      });
    });

    it('emits RoomGameEvent (room extra)', () => {
      gameSocketSubject$.next(
        '<component id="room extra">Lorem ipsum</component>\n'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomExtra: 'Lorem ipsum',
      });
    });

    it('emits ServerTimeGameEvent', () => {
      gameSocketSubject$.next('<prompt time="1703804031">&gt;</prompt>\n');

      expectGameEvent({
        type: GameEventType.SERVER_TIME,
        time: 1703804031,
      });
    });

    it('emits RoundTimeGameEvent', () => {
      gameSocketSubject$.next('<roundTime value="1703804031"/>\n');

      expectGameEvent({
        type: GameEventType.ROUND_TIME,
        time: 1703804031,
      });
    });

    it('emits CastTimeGameEvent', () => {
      gameSocketSubject$.next('<castTime value="1703804031"/>\n');

      expectGameEvent({
        type: GameEventType.CAST_TIME,
        time: 1703804031,
      });
    });
  });
});
