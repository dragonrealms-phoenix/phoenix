import { useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { isEmpty } from 'lodash';
import dynamic from 'next/dynamic';
import { useObservable, useSubscription } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { GameEventType } from '../../common/game';
import type {
  ExperienceGameEvent,
  GameEvent,
  RoomGameEvent,
} from '../../common/game';
import { GameContent } from '../components/game';
import type { GameLogLine } from '../components/game';
import { Grid } from '../components/grid';
import { useLogger } from '../hooks/logger';

// The grid dynamically modifies the DOM, so we can't use SSR
// because the server and client DOMs will be out of sync.
// https://nextjs.org/docs/messages/react-hydration-error
const GridNoSSR = dynamic(async () => Grid, { ssr: false });

// I started tracking this via `useState` but when calling it's setter
// the value did not update fast enough before a text game event
// was received, resulting in text routing to the wrong stream window.
let gameStreamId = '';
let textOutputClass = '';
let textStylePreset = '';
let textStyleBold = false;

const GridPage: React.FC = (): ReactNode => {
  const { logger } = useLogger('page:grid');

  // Game events will be emitted from the IPC `game:event` channel.
  // Here we subscribe and route them to the correct grid item.
  const gameEventsSubject$ = useObservable(() => {
    return new rxjs.Subject<GameEvent>();
  });

  // Content destined for a specific game stream window (aka grid item).
  // These include any applicable styling and formatting.
  // Example stream ids include 'room', 'experience', 'combat', etc.
  const gameLogLineSubject$ = useObservable(() => {
    return new rxjs.Subject<GameLogLine>();
  });

  const { euiTheme } = useEuiTheme();

  const formatExperienceText = useCallback(
    (gameEvent: ExperienceGameEvent): string => {
      const { skill, rank, percent, mindState } = gameEvent;
      const txtSkill = skill.padStart(15);
      const txtRank = String(rank).padStart(3);
      const txtPercent = String(percent).padStart(2) + '%';
      const txtMindState = mindState.padEnd(15);
      // TODO add option to show mind state as the numbers (x/34)
      return `${txtSkill} ${txtRank} ${txtPercent} ${txtMindState}`;
    },
    []
  );

  const formatRoomText = useCallback((gameEvent: RoomGameEvent): string => {
    const { roomName, roomDescription } = gameEvent;
    const { roomObjects, roomPlayers, roomExits } = gameEvent;

    const text = [
      roomName,
      [roomDescription, roomObjects].join('  '), // two spaces between sentences
      roomPlayers,
      roomExits,
    ]
      .filter((s) => !isEmpty(s?.trim()))
      .join('\n');

    return text;
  }, []);

  const [_roomGameEvent, setRoomGameEvent] = useState<RoomGameEvent>({
    type: GameEventType.ROOM,
    eventId: uuid(),
  });

  // Track high level game events such as stream ids and formatting.
  // Re-emit text events to the game stream subject to get to grid items.
  useSubscription(gameEventsSubject$, (gameEvent: GameEvent) => {
    const textStyles = css({
      fontFamily:
        textOutputClass === 'mono'
          ? euiTheme.font.familyCode
          : euiTheme.font.family,
      fontSize: euiTheme.size.m,
      fontWeight: textStyleBold
        ? euiTheme.font.weight.bold
        : euiTheme.font.weight.regular,
      lineHeight: 'initial',
      paddingLeft: euiTheme.size.s,
      paddingRight: euiTheme.size.s,
    });

    switch (gameEvent.type) {
      case GameEventType.CLEAR_STREAM:
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: gameEvent.streamId,
          styles: textStyles,
          text: '__CLEAR_STREAM__',
        });
        break;
      case GameEventType.PUSH_STREAM:
        gameStreamId = gameEvent.streamId;
        break;
      case GameEventType.POP_STREAM:
        gameStreamId = '';
        break;
      case GameEventType.PUSH_BOLD:
        textStyleBold = true;
        break;
      case GameEventType.POP_BOLD:
        textStyleBold = false;
        break;
      case GameEventType.TEXT_OUTPUT_CLASS:
        textOutputClass = gameEvent.textOutputClass;
        break;
      case GameEventType.TEXT_STYLE_PRESET:
        textStylePreset = gameEvent.textStylePreset;
        break;
      case GameEventType.TEXT:
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: gameStreamId,
          styles: textStyles,
          text: gameEvent.text,
        });
        break;
      case GameEventType.EXPERIENCE:
        // TODO need to track a map of skill names to their latest event
        //      so that when we receive a new event we can update that skill
        //      then clear the exp stream and render all skills again
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: 'experience',
          styles: css(textStyles, { fontFamily: euiTheme.font.familyCode }),
          text: formatExperienceText(gameEvent),
        });
        break;
      case GameEventType.ROOM:
        setRoomGameEvent((oldRoom: RoomGameEvent) => {
          let newRoom: RoomGameEvent;

          // Each room game event only contains the field that has changed.
          // If this is a new room then clear the other fields.
          // Otherwise merge the new fields into the existing room.
          if (gameEvent.roomName) {
            newRoom = gameEvent;
          } else {
            newRoom = {
              ...oldRoom,
              ...gameEvent,
            };
          }

          // The room stream is special in that it only displays
          // the text for the current room, not a history of rooms.
          // Therefore, we clear the stream before displaying the new room.
          gameLogLineSubject$.next({
            eventId: oldRoom.eventId,
            streamId: 'room',
            styles: textStyles,
            text: '__CLEAR_STREAM__',
          });

          gameLogLineSubject$.next({
            eventId: newRoom.eventId,
            streamId: 'room',
            styles: textStyles,
            text: formatRoomText(newRoom),
          });

          return newRoom;
        });
        break;
      case GameEventType.COMPASS:
        // TODO
        break;
      case GameEventType.VITALS:
        // TODO
        break;
      case GameEventType.INDICATOR:
        // TODO
        break;
      case GameEventType.SPELL:
        // TODO
        break;
      case GameEventType.LEFT_HAND:
        // TODO
        break;
      case GameEventType.RIGHT_HAND:
        // TODO
        break;
      case GameEventType.SERVER_TIME:
        // TODO
        break;
      case GameEventType.ROUND_TIME:
        // TODO
        break;
    }
  });

  useEffect(() => {
    window.api.onMessage(
      'game:connect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:connect', { accountName, characterName, gameCode });
      }
    );

    return () => {
      window.api.removeAllListeners('game:connect');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage(
      'game:disconnect',
      (_event, { accountName, characterName, gameCode }) => {
        logger.info('game:disconnect', {
          accountName,
          characterName,
          gameCode,
        });
      }
    );

    return () => {
      window.api.removeAllListeners('game:disconnect');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage('game:error', (_event, error: Error) => {
      logger.error('game:error', { error });
    });

    return () => {
      window.api.removeAllListeners('game:error');
    };
  }, [logger]);

  useEffect(() => {
    window.api.onMessage('game:event', (_event, gameEvent) => {
      logger.debug('game:event', { gameEvent });
      gameEventsSubject$.next(gameEvent);
    });

    return () => {
      window.api.removeAllListeners('game:event');
    };
  }, [logger, gameEventsSubject$]);

  // TODO the list of items we inject should come from user preferences
  //      if none then provide our own default list

  // TODO users should be able to add/remove items from the grid
  //      we already support closing grid items, but not synced to prefs yet

  return (
    <GridNoSSR
      items={[
        {
          itemId: 'room',
          title: 'Room',
          content: (
            <GameContent
              gameStreamIds={['room']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={false}
            />
          ),
        },
        {
          itemId: 'experience',
          title: 'Experience',
          content: (
            <GameContent
              gameStreamIds={['experience']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={false}
            />
          ),
        },
        {
          itemId: 'percWindow',
          title: 'Spells',
          content: (
            <GameContent
              gameStreamIds={['percWindow']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={false}
            />
          ),
        },
        {
          itemId: 'inv',
          title: 'Inventory',
          content: (
            <GameContent
              gameStreamIds={['inv']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={false}
            />
          ),
        },
        {
          itemId: 'familiar',
          title: 'Familiar',
          content: (
            <GameContent
              gameStreamIds={['familiar']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={true}
            />
          ),
        },
        {
          itemId: 'thoughts',
          title: 'Thoughts',
          content: (
            <GameContent
              gameStreamIds={['thoughts']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={true}
            />
          ),
        },
        {
          itemId: 'combat',
          title: 'Combat',
          content: (
            <GameContent
              gameStreamIds={['combat']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={true}
            />
          ),
        },
        {
          itemId: 'logons',
          title: 'Logons',
          content: (
            <GameContent
              gameStreamIds={['logons']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={true}
            />
          ),
        },
        {
          itemId: 'death',
          title: 'Deaths',
          content: (
            <GameContent
              gameStreamIds={['death']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={true}
            />
          ),
        },
        {
          itemId: 'main',
          title: 'Main',
          content: (
            <GameContent
              gameStreamIds={['']}
              stream$={gameLogLineSubject$}
              enableScrollToNewLogLines={true}
            />
          ),
        },
      ]}
    />
  );
};

export default GridPage;
