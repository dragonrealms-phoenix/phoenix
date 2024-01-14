import { EuiFieldText, useEuiTheme } from '@elastic/eui';
import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import { isEmpty } from 'lodash';
import dynamic from 'next/dynamic';
import { useObservable, useSubscription } from 'observable-hooks';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { runInBackground } from '../../common/async';
import { ExperienceMindStateMap, GameEventType } from '../../common/game';
import type {
  ExperienceGameEvent,
  GameEvent,
  RoomGameEvent,
} from '../../common/game';
import { GameStream } from '../components/game-stream';
import { Grid } from '../components/grid';
import { useLogger } from '../hooks/logger';
import { useWindowDimensions } from '../hooks/window-dimensions';
import type { GameLogLine } from '../types/game.types';

// The grid dynamically modifies the DOM, so we can't use SSR
// because the server and client DOMs will be out of sync.
// https://nextjs.org/docs/messages/react-hydration-error
const GridNoSSR = dynamic(async () => Grid, { ssr: false });

// I started tracking these via `useState` but when calling their setter
// the value did not update fast enough before a text game event
// was received, resulting in text routing to the wrong stream window
// or not formatting correctly. So I moved them to global variables.
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

  // Do no memoize this function with `useCallback` or `useMemo`
  // because it needs to reference the current values of both
  // tracked and non-tracked variables.
  // If we memoize it then stale values would be used.
  const computeTextStyles = (): SerializedStyles => {
    // TODO user pref for 'mono' or 'serif' font family and size
    let fontFamily = `Verdana, ${euiTheme.font.familySerif}`;
    let fontSize = '14px';
    let fontWeight = euiTheme.font.weight.regular;
    let fontColor = euiTheme.colors.text;

    if (textOutputClass === 'mono') {
      fontFamily = `${euiTheme.font.familyCode}`;
      fontSize = euiTheme.size.m;
    }

    if (textStyleBold) {
      fontWeight = euiTheme.font.weight.bold;
    }

    if (textStylePreset === 'roomName') {
      fontColor = euiTheme.colors.title;
      fontWeight = euiTheme.font.weight.bold;
    }

    const textStyles = css({
      fontFamily,
      fontSize,
      fontWeight,
      color: fontColor,
      lineHeight: 'initial',
      paddingLeft: euiTheme.size.s,
      paddingRight: euiTheme.size.s,
    });

    return textStyles;
  };

  // TODO refactor to a ExperienceGameStream component
  //      it will know all skills to render and can highlight
  //      ones that pulse, toggle between mind state and mind state rate, etc
  const formatExperienceText = useCallback(
    (gameEvent: ExperienceGameEvent): string => {
      const { skill, rank, percent, mindState } = gameEvent;
      const mindStateRate = ExperienceMindStateMap[mindState];

      const txtSkill = skill.padStart(15);
      const txtRank = String(rank).padStart(3);
      const txtPercent = String(percent).padStart(2) + '%';

      // TODO add user pref to toggle between mind state rate and mind state
      const txtMindStateRate = `(${mindStateRate}/34)`.padStart(7);
      // const txtMindState = mindState.padEnd(15);

      return [
        txtSkill,
        txtRank,
        txtPercent,
        txtMindStateRate,
        // txtMindState,
      ].join(' ');
    },
    []
  );

  // TODO refactor to a RoomGameStream component
  //      so that it subscribes to all the room events
  //      and updates and formats the text as needed
  //      This would allow the room name to be formatted
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
    const textStyles = computeTextStyles();

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
      case GameEventType.CAST_TIME:
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

  // TODO move to a new GameCommandInput component
  const onKeyDownCommandInput = useCallback<
    KeyboardEventHandler<HTMLInputElement>
  >((event) => {
    const command = event.currentTarget.value;
    // TODO implement command history to track last N commands
    //      pressing up/down arrow keys should cycle through history
    //      pressing down arrow key when at the end of history should clear input
    //      pressing up arrow key when at the beginning of history should do nothing
    if (event.code === 'Enter' && !isEmpty(command)) {
      event.currentTarget.value = '';
      runInBackground(async () => {
        await window.api.sendCommand(command);
      });
    }
  }, []);

  const windowDimensions = useWindowDimensions();
  const dimensions = useMemo(() => {
    const { height, width } = windowDimensions;
    if (height && width) {
      return {
        height: height - 50,
        width,
      };
    }
    return {
      height: 0,
      width: 0,
    };
  }, [windowDimensions]);

  return (
    <>
      {/* TODO figure out sizing of grid so that when height shortens then it doesn't overlap elements below it */}
      <GridNoSSR
        dimensions={dimensions}
        items={[
          {
            itemId: 'room',
            title: 'Room',
            content: (
              <GameStream
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
              <GameStream
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
              <GameStream
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
              <GameStream
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
              <GameStream
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
              <GameStream
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
              <GameStream
                gameStreamIds={['combat']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'assess',
            title: 'Assess',
            content: (
              <GameStream
                gameStreamIds={['assess']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'logons',
            title: 'Arrivals',
            content: (
              <GameStream
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
              <GameStream
                gameStreamIds={['death']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'atmospherics',
            title: 'Atmospherics',
            content: (
              <GameStream
                gameStreamIds={['atmospherics']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'chatter',
            title: 'Chatter',
            content: (
              <GameStream
                gameStreamIds={['chatter']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'conversation',
            title: 'Conversation',
            content: (
              <GameStream
                gameStreamIds={['conversation']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'whispers',
            title: 'Whispers',
            content: (
              <GameStream
                gameStreamIds={['whispers']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'talk',
            title: 'Talk',
            content: (
              <GameStream
                gameStreamIds={['talk']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'ooc',
            title: 'OOC',
            content: (
              <GameStream
                gameStreamIds={['ooc']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'group',
            title: 'Group',
            content: (
              <GameStream
                gameStreamIds={['group']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
          {
            itemId: 'main',
            title: 'Main',
            content: (
              <GameStream
                gameStreamIds={['']}
                stream$={gameLogLineSubject$}
                enableScrollToNewLogLines={true}
              />
            ),
          },
        ]}
      />
      {/* TODO create a GameCommandBar component that combines GameRoundTime and GameCommandInput components */}
      {/* TODO refactor this to its own GameCommandInput component */}
      <EuiFieldText
        compressed={true}
        fullWidth={true}
        prepend={'RT'}
        tabIndex={0}
        onKeyDown={onKeyDownCommandInput}
      />
    </>
  );
};

// nextjs pages must be default exports
export default GridPage;
