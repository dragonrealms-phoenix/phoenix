import type { IpcRendererEvent } from 'electron';
import { EuiFieldText, EuiPageTemplate, useEuiTheme } from '@elastic/eui';
import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import isEmpty from 'lodash-es/isEmpty.js';
import { useObservable, useSubscription } from 'observable-hooks';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { getExperienceMindState } from '../../common/game/get-experience-mindstate.js';
import type {
  ExperienceGameEvent,
  GameCommandMessage,
  GameEvent,
  GameEventMessage,
  RoomGameEvent,
} from '../../common/game/types.js';
import { GameEventType } from '../../common/game/types.js';
import { GameStream } from '../components/game/game-stream.jsx';
import type { GridItemMetadata } from '../components/grid/grid-item.jsx';
import type { GridContentItem } from '../components/grid/grid.jsx';
import { Grid } from '../components/grid/grid.jsx';
import { NoSSR } from '../components/no-ssr/no-ssr.jsx';
import { useLogger } from '../hooks/logger.jsx';
import { useMeasure } from '../hooks/measure.js';
import { useWindowSize } from '../hooks/window-size.js';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { GameLogLine } from '../types/game.types.js';

// The grid dynamically modifies the DOM, so we can't use SSR
// because the server and client DOMs will be out of sync.
// https://nextjs.org/docs/messages/react-hydration-error
const GridNoSSR = NoSSR(Grid);

// I started tracking these via `useState` but when calling their setter
// the value did not update fast enough before a text game event
// was received, resulting in text routing to the wrong stream window
// or not formatting correctly. So I moved them to global variables.
let gameStreamId = '';
let textOutputClass = '';
let textStylePreset = '';
let textStyleBold = false;

const GridPage: React.FC = (): ReactNode => {
  const logger = useLogger('page:grid');

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
      const mindStateRate = getExperienceMindState(mindState) ?? 0;

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
    const unsubscribe = window.api.onMessage(
      'game:event',
      (_event: IpcRendererEvent, message: GameEventMessage) => {
        const { gameEvent } = message;
        logger.debug('game:event', { gameEvent });
        gameEventsSubject$.next(gameEvent);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger, gameEventsSubject$]);

  // When the user sends a command, echo it to the main game stream so that
  // the user sees what they sent and can correlate to the game response.
  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:command',
      (_event: IpcRendererEvent, message: GameCommandMessage) => {
        const { command } = message;
        logger.debug('game:command', { command });
        gameLogLineSubject$.next({
          eventId: uuid(),
          // TODO create some constants for known stream ids, '' = main window
          streamId: '',
          // TODO clean up this mess
          styles: css({
            fontFamily: `Verdana, ${euiTheme.font.familySerif}`,
            fontSize: '14px',
            fontWeight: euiTheme.font.weight.regular,
            color: euiTheme.colors.subduedText,
            lineHeight: 'initial',
            paddingLeft: euiTheme.size.s,
            paddingRight: euiTheme.size.s,
          }),
          text: `> ${command}`,
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [logger, gameLogLineSubject$, euiTheme]);

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

  // Calculating the height for the grid is tricky.
  // Something about how `EuiPageTemplate.Section` is styled, the height
  // is not able to be observed or measured. It's always zero.
  // The width, however, does calculate correctly as the page resizes.
  // As a workaround, I take the window height minus other elements in the
  // same column as the grid to approximate the allowed grid height.
  const windowSize = useWindowSize();
  const [bottomBarRef, bottomBarSize] = useMeasure<HTMLInputElement>();
  const [gridWidthRef, { width: gridWidth }] = useMeasure<HTMLDivElement>();
  const gridHeight = windowSize.height - bottomBarSize.height - 40;

  interface GridConfigItem {
    itemId: string; // 'room'
    title: string; // 'Room'
    whenVisibleStreamToItemIds: Array<string>; // ['room'], always streams to itself, may also stream elsewhere
    whenHiddenStreamToItemIds: Array<string>; // ['main'], default streams nowhere else, may also stream elsewhere
  }

  const configGridItems: Array<GridConfigItem> = [];

  configGridItems.push({
    itemId: 'room',
    title: 'Room',
    whenVisibleStreamToItemIds: ['room'],
    whenHiddenStreamToItemIds: ['main'],
  });

  configGridItems.push({
    itemId: 'experience',
    title: 'Experience',
    whenVisibleStreamToItemIds: ['experience'],
    whenHiddenStreamToItemIds: ['main'],
  });

  configGridItems.push({
    itemId: 'main',
    title: 'Main',
    whenVisibleStreamToItemIds: ['main'],
    whenHiddenStreamToItemIds: [''],
  });

  configGridItems.push({
    itemId: 'percWindow',
    title: 'Spells',
    whenVisibleStreamToItemIds: ['percWindow'],
    whenHiddenStreamToItemIds: [],
  });

  const configItemIds = configGridItems.map((configItem) => {
    return configItem.itemId;
  });

  let layoutGridItems: Array<GridItemMetadata> = [];

  layoutGridItems.push({
    itemId: 'room',
    itemTitle: 'Room',
    isFocused: false,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  layoutGridItems.push({
    itemId: 'experience',
    itemTitle: 'Experience',
    isFocused: false,
    x: 200,
    y: 0,
    width: 100,
    height: 100,
  });

  layoutGridItems.push({
    itemId: 'main',
    itemTitle: 'Main',
    isFocused: true,
    x: 0,
    y: 200,
    width: 200,
    height: 200,
  });

  // Drop any items that no longer have a matching config item.
  layoutGridItems = layoutGridItems.filter((layoutItem) => {
    return configItemIds.includes(layoutItem.itemId);
  });

  const layoutItemIds = layoutGridItems.map((layoutItem) => {
    return layoutItem.itemId;
  });

  const itemIdToStreamIdsMap: Record<string, Array<string>> = {};

  // If layout includes the config item then stream to its visible items.
  // If layout does not include the config item then stream to its hidden items.
  configGridItems.forEach((configItem) => {
    const streamToItemIds = layoutItemIds.includes(configItem.itemId)
      ? configItem.whenVisibleStreamToItemIds
      : configItem.whenHiddenStreamToItemIds;

    streamToItemIds.forEach((streamToItemId) => {
      itemIdToStreamIdsMap[streamToItemId] ||= [];
      itemIdToStreamIdsMap[streamToItemId].push(configItem.itemId);
    });
  });

  const contentGridItems: Array<GridContentItem> = [];

  layoutGridItems.forEach((layoutItem) => {
    const configItem = configGridItems.find((configItem) => {
      return configItem.itemId === layoutItem.itemId;
    });

    contentGridItems.push({
      layout: {
        ...layoutItem,
        itemTitle: configItem?.title ?? layoutItem.itemTitle,
      },
      content: (
        <GameStream
          gameStreamIds={itemIdToStreamIdsMap[layoutItem.itemId].map(
            (streamId) => {
              return streamId === 'main' ? '' : streamId;
            }
          )}
          stream$={gameLogLineSubject$}
        />
      ),
    });
  });

  return (
    <EuiPageTemplate
      direction="column"
      paddingSize="s"
      panelled={false}
      grow={true}
      restrictWidth={false}
      responsive={[]}
      css={{ height: '100%', maxWidth: 'unset' }}
    >
      <EuiPageTemplate.Section grow={true}>
        <div ref={gridWidthRef}>
          <GridNoSSR
            boundary={{
              height: gridHeight,
              width: gridWidth,
            }}
            contentItems={contentGridItems}
          />
        </div>
      </EuiPageTemplate.Section>
      <EuiPageTemplate.BottomBar>
        <div ref={bottomBarRef}>
          <EuiFieldText
            compressed={true}
            fullWidth={true}
            prepend={'RT'}
            tabIndex={0}
            onKeyDown={onKeyDownCommandInput}
          />
        </div>
      </EuiPageTemplate.BottomBar>
    </EuiPageTemplate>
  );
};

// nextjs pages must be default exports
export default GridPage;
