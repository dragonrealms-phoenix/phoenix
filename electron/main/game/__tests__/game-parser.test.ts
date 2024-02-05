import * as rxjs from 'rxjs';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GameEvent,
  GameEventType,
  IndicatorType,
} from '../../../common/game/types.js';
import { GameParserImpl } from '../game.parser.js';
import type { GameParser } from '../types.js';

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
    vi.useRealTimers();
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

    it('emits TextGameEvent', () => {
      gameSocketSubject$.next('test');

      expectGameEvent({
        type: GameEventType.TEXT,
        text: `test\n`,
      });
    });

    it('emits PushBoldGameEvent', () => {
      gameSocketSubject$.next('<pushBold/>');

      expectGameEvent({
        type: GameEventType.PUSH_BOLD,
      });
    });

    it('emits PopBoldGameEvent', () => {
      gameSocketSubject$.next('<popBold/>');

      expectGameEvent({
        type: GameEventType.POP_BOLD,
      });
    });

    it('emits TextOutputClassGameEvent (mono)', () => {
      gameSocketSubject$.next('<output class="mono"/>');

      expectGameEvent({
        type: GameEventType.TEXT_OUTPUT_CLASS,
        textOutputClass: 'mono',
      });
    });

    it('emits TextOutputClassGameEvent (blank)', () => {
      gameSocketSubject$.next('<output class=""/>');

      expectGameEvent({
        type: GameEventType.TEXT_OUTPUT_CLASS,
        textOutputClass: '',
      });
    });

    it('emits TextStylePresetGameEvent', () => {
      gameSocketSubject$.next('<preset id="roomName"/>');

      expectGameEvent({
        type: GameEventType.TEXT_STYLE_PRESET,
        textStylePreset: 'roomName',
      });
    });

    it('emits IndicatorGameEvent (visible)', () => {
      gameSocketSubject$.next('<indicator id="IconBLEEDING" visible="y"/>');

      expectGameEvent({
        type: GameEventType.INDICATOR,
        indicator: IndicatorType.BLEEDING,
        active: true,
      });
    });

    it('emits IndicatorGameEvent (not visible)', () => {
      gameSocketSubject$.next('<indicator id="IconBLEEDING" visible="n"/>');

      expectGameEvent({
        type: GameEventType.INDICATOR,
        indicator: IndicatorType.BLEEDING,
        active: false,
      });
    });

    it('emits SpellGameEvent', () => {
      gameSocketSubject$.next('<spell>Fire Shards</spell>');

      expectGameEvent({
        type: GameEventType.SPELL,
        spell: 'Fire Shards',
      });
    });

    it('emits HandGameEvent', () => {
      gameSocketSubject$.next('<left>Empty</left>');
      gameSocketSubject$.next('<right>red backpack</right>');

      expectGameEvent({
        type: GameEventType.LEFT_HAND,
        item: 'Empty',
      });

      expectGameEvent({
        type: GameEventType.RIGHT_HAND,
        item: 'red backpack',
      });
    });

    it('emits ClearStreamGameEvent', () => {
      gameSocketSubject$.next('<clearStream id="inv"/>');

      expectGameEvent({
        type: GameEventType.CLEAR_STREAM,
        streamId: 'inv',
      });
    });

    it('emits PushStreamGameEvent', () => {
      gameSocketSubject$.next('<pushStream id="experience"/>');

      expectGameEvent({
        type: GameEventType.PUSH_STREAM,
        streamId: 'experience',
      });
    });

    it('emits PopStreamGameEvent', () => {
      gameSocketSubject$.next('<popStream/>');

      expectGameEvent({
        type: GameEventType.POP_STREAM,
      });
    });

    it('emits CompassGameEvent', () => {
      gameSocketSubject$.next(
        '<compass><dir value="e"/><dir value="sw"/><dir value="out"/></compass>'
      );

      expectGameEvent({
        type: GameEventType.COMPASS,
        directions: ['e', 'sw', 'out'],
      });
    });

    it('emits VitalsGameEvent', () => {
      gameSocketSubject$.next('<progressBar id="health" value="100"/>');

      expectGameEvent({
        type: GameEventType.VITALS,
        vitalId: 'health',
        value: 100,
      });
    });

    it('emits ExperienceGameEvent', () => {
      gameSocketSubject$.next(
        '<component id="exp Attunement">      Attunement:    1 46% attentive    </component>'
      );

      expectGameEvent({
        type: GameEventType.EXPERIENCE,
        skill: 'Attunement',
        mindState: 'attentive',
        rank: 1,
        percent: 46,
      });
    });

    it('emits ExperienceGameEvent (blank)', () => {
      gameSocketSubject$.next('<component id="exp Attunement"></component>');

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
        '<streamWindow id="room" subtitle=" - [Provincial Bank, Teller]" />'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomName: '[Provincial Bank, Teller]',
      });
    });

    it('emits RoomGameEvent (room description)', () => {
      gameSocketSubject$.next(
        '<component id="room desc">A neat row of barred windows...</component>'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomDescription: 'A neat row of barred windows...',
      });
    });

    it('emits RoomGameEvent (room objects)', () => {
      gameSocketSubject$.next(
        '<component id="room objects">You also see a small calendar...</component>'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomObjects: 'You also see a small calendar...',
      });
    });

    it('emits RoomGameEvent (room objs)', () => {
      gameSocketSubject$.next(
        '<component id="room objs">You also see a small calendar...</component>'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomObjects: 'You also see a small calendar...',
      });
    });

    it('emits RoomGameEvent (room players)', () => {
      gameSocketSubject$.next(
        '<component id="room players">Also here: Katoak.</component>'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomPlayers: 'Also here: Katoak.',
      });
    });

    it('emits RoomGameEvent (room exits)', () => {
      gameSocketSubject$.next(
        '<component id="room exits">Obvious exits: <d>out</d>.<compass></compass></component></component>'
      );

      expectGameEvent({
        type: GameEventType.ROOM,
        roomExits: 'Obvious exits: out.',
      });
    });

    it('emits ServerTimeGameEvent', () => {
      gameSocketSubject$.next('<prompt time="1703804031">&gt;</prompt>');

      expectGameEvent({
        type: GameEventType.SERVER_TIME,
        time: 1703804031,
      });
    });

    it('emits RoundTimeGameEvent', () => {
      gameSocketSubject$.next('<roundTime value="1703804031"/>');

      expectGameEvent({
        type: GameEventType.ROUND_TIME,
        time: 1703804031,
      });
    });

    it('emits CastTimeGameEvent', () => {
      gameSocketSubject$.next('<castTime value="1703804031"/>');

      expectGameEvent({
        type: GameEventType.CAST_TIME,
        time: 1703804031,
      });
    });
  });
});
