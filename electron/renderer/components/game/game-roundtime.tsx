import { useEuiTheme } from '@elastic/eui';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { useSubscribe } from '../../hooks/pubsub.jsx';

interface GameTimeDisplayProps {
  currentTime: number;
  initialTime: number;
  fillColor: string;
  textColor: string;
  type: 'RoundTime' | 'CastTime';
}

const GameTimeDisplay: React.FC<GameTimeDisplayProps> = (
  options: GameTimeDisplayProps
) => {
  const { currentTime, initialTime, type } = options;

  const { euiTheme } = useEuiTheme();

  const typeAbbrev = type === 'RoundTime' ? 'RT' : 'CT';
  const typeLabel = type === 'RoundTime' ? 'Round Time' : 'Cast Time';

  const fillColor = currentTime > 0 ? options.fillColor : 'inherit';
  const textColor = currentTime > 0 ? options.textColor : 'inherit';

  const fillWidth = (currentTime / initialTime) * 100 || 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '25px',
        margin: 0,
        padding: 0,
        border: '1px solid',
        borderRadius: '5px',
        borderColor: euiTheme.border.color,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: `${fillWidth}%`,
          height: '100%',
          backgroundColor: fillColor,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          lineHeight: euiTheme.size.l,
          fontSize: euiTheme.size.m,
          color: textColor,
        }}
      >
        {currentTime > 0 && currentTime}
        {currentTime <= 0 && <span title={typeLabel}>{typeAbbrev}</span>}
      </div>
    </div>
  );
};

GameTimeDisplay.displayName = 'GameTimeDisplay';

export const GameRoundTime: React.FC = () => {
  const { euiTheme } = useEuiTheme();

  const nowInSeconds = useCallback(() => {
    return Math.floor(Date.now() / 1000);
  }, []);

  // Machine-friendly timestamps (in seconds).
  // Example: '1737941270'.
  const serverTimeRef = useRef<number>(0); // current time on game server
  const roundTimeRef = useRef<number>(0); // future time when can take action
  const castTimeRef = useRef<number>(0); // future time when spell is prepared

  // User-friendly remaining durations (in seconds).
  // Example: '6' (for 6 seconds remaining).
  // The 'current' values are decremented every second.
  // It's how many seconds are left until the action can be taken.
  // The 'initial' values are how many seconds to wait in total.
  // Together, they allow us to proportionally style the progress bars.
  const [currentRT, setCurrentRT] = useState<number>(0);
  const [initialRT, setInitialRT] = useState<number>(0);
  const [currentCT, setCurrentCT] = useState<number>(0);
  const [initialCT, setInitialCT] = useState<number>(0);

  // Interval for updating remaining round time.
  // Used to refresh the UI every second.
  const intervalRef = useRef<NodeJS.Timeout>();

  // Recalculates the remaining round time.
  const calculateRoundTimes = useCallback(() => {
    const elapsed = nowInSeconds();
    setCurrentRT(Math.max(0, roundTimeRef.current - elapsed));
    setCurrentCT(Math.max(0, castTimeRef.current - elapsed));
  }, [nowInSeconds]);

  // Periodically recalculate the round time UI for the user.
  useEffect(() => {
    calculateRoundTimes();
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        width: '50px',
      }}
    >
      <GameTimeDisplay
        type="RoundTime"
        currentTime={currentRT}
        initialTime={initialRT}
        textColor={euiTheme.colors.fullShade}
        fillColor="#FF8C00"
      />
      <GameTimeDisplay
        type="CastTime"
        currentTime={currentCT}
        initialTime={initialCT}
        textColor={euiTheme.colors.fullShade}
        fillColor={euiTheme.colors.primary}
      />
    </div>
  );
};

GameRoundTime.displayName = 'GameRoundTime';
