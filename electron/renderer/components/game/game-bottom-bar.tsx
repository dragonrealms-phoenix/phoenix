import { EuiFieldText, useEuiTheme } from '@elastic/eui';
import { animated, useSpring } from '@react-spring/web';
import type { KeyboardEvent, KeyboardEventHandler, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { isEmpty } from '../../../common/string/string.utils.js';
import { useCommandHistory } from '../../hooks/command-history.jsx';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

interface GameTimeDisplayProps {
  currentTime: number;
  initialTime: number;
  fillColor: string;
  textColor: string;
}

const GameTimeDisplay: React.FC<GameTimeDisplayProps> = (
  options: GameTimeDisplayProps
) => {
  const { currentTime, initialTime } = options;

  const fillColor = currentTime > 0 ? options.fillColor : 'inherit';
  const textColor = currentTime > 0 ? options.textColor : 'inherit';

  const fillHeight = (currentTime / initialTime) * 100 || 0;

  const fillSpringProps = useSpring({
    height: `${fillHeight}%`,
    immediate: true,
  });

  return (
    <div
      style={{
        display: 'inline-block',
        width: '30px',
        height: '30px',
        position: 'relative',
        margin: 0,
        padding: 0,
      }}
    >
      <animated.div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: fillColor,
          ...fillSpringProps,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          lineHeight: '30px',
          textAlign: 'center',
          zIndex: 1,
          color: textColor,
        }}
      >
        {currentTime}
      </div>
    </div>
  );
};

GameTimeDisplay.displayName = 'GameTimeDisplay';

export interface GameBottomBarProps {
  // TODO
  todo?: true;
}

export const GameBottomBar: React.FC<GameBottomBarProps> = (
  props: GameBottomBarProps
): ReactNode => {
  const { input, handleKeyDown, handleOnChange } = useCommandHistory();

  const { euiTheme } = useEuiTheme();

  const nowInSeconds = useCallback(() => {
    return Math.floor(Date.now() / 1000);
  }, []);

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // Handle any history navigation.
      handleKeyDown(event);
      // Handle the "Enter" key to submit command to game.
      const command = event.currentTarget.value;
      if (event.code === 'Enter' && !isEmpty(command)) {
        runInBackground(async () => {
          await window.api.sendCommand(command);
        });
      }
    },
    [handleKeyDown]
  );

  // Machine-friendly timestamps (in seconds).
  // Example: '1737941270'.
  const serverTimeRef = useRef<number>(0); // current time on game server
  const roundTimeRef = useRef<number>(0); // future time when can take action
  const castTimeRef = useRef<number>(0); // future time when spell prepared

  // User-friendly remaining durations (in seconds).
  // Example: '6' (for 6 seconds remaining).
  const [currentRT, setCurrentRT] = useState<number>(0);
  const [initialRT, setInitialRT] = useState<number>(0);
  const [currentCT, setCurrentCT] = useState<number>(0);
  const [initialCT, setInitialCT] = useState<number>(0);

  // Interval for updating remaining round time.
  // Used to refresh the UI every second.
  const intervalRef = useRef<NodeJS.Timeout>();

  // Recalculates the remaining round time.
  const calculateRoundTimes = useCallback(() => {
    const elapsed = Math.floor(Date.now() / 1000); // current time in seconds
    const remainingRT = Math.max(0, roundTimeRef.current - elapsed);
    const remainingCT = Math.max(0, castTimeRef.current - elapsed);
    setCurrentRT(remainingRT);
    setCurrentCT(remainingCT);
  }, []);

  // Periodically recalculate the round time UI for the user.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      calculateRoundTimes();
    }, 1000);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [calculateRoundTimes]);

  // Technically, we don't need to explicitly recalculate the round time
  // when these game events are received, but doing so will immediately
  // refresh the UI when new roundtimes are incurred rather than on a delay.
  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    switch (gameEvent.type) {
      case GameEventType.SERVER_TIME:
        serverTimeRef.current = gameEvent.time;
        calculateRoundTimes();
        break;
      case GameEventType.ROUND_TIME:
        roundTimeRef.current = gameEvent.time;
        setInitialRT(roundTimeRef.current - nowInSeconds());
        calculateRoundTimes();
        break;
      case GameEventType.CAST_TIME:
        castTimeRef.current = gameEvent.time;
        setInitialCT(castTimeRef.current - nowInSeconds());
        calculateRoundTimes();
        break;
    }
  });

  return (
    <EuiFieldText
      value={input}
      compressed={true}
      fullWidth={true}
      prepend={
        <>
          <div
            style={{
              display: 'inline-block',
              textAlign: 'center',
              marginRight: '5px',
            }}
          >
            <div>R</div>
            <div>T</div>
          </div>
          <GameTimeDisplay
            currentTime={currentRT}
            initialTime={initialRT}
            // TODO: use text color that contrats better with background
            textColor={euiTheme.colors.dangerText}
            fillColor={euiTheme.colors.warning}
          />
          <GameTimeDisplay
            currentTime={currentCT}
            initialTime={initialCT}
            // TODO: use text color that contrats better with background
            textColor={euiTheme.colors.dangerText}
            fillColor={euiTheme.colors.primary}
          />
        </>
      }
      tabIndex={0}
      onKeyDown={onKeyDown}
      onChange={handleOnChange}
    />
  );
};
