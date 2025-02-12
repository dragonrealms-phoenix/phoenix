import { useEuiTheme } from '@elastic/eui';
import type { ReactElement, ReactNode } from 'react';
import { useContext, useMemo, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { GameContext } from '../../context/game.jsx';
import { useSubscribe } from '../../hooks/pubsub.jsx';

export const GameStatusBars: React.FC = (): ReactNode => {
  const { euiTheme } = useEuiTheme();

  const [health, setHealth] = useState<number>(100);
  const [mana, setMana] = useState<number>(100);
  const [concentration, setConcentration] = useState<number>(100);
  const [stamina, setStamina] = useState<number>(100);
  const [spirit, setSpirit] = useState<number>(100);

  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    if (gameEvent.type === GameEventType.VITALS) {
      switch (gameEvent.vitalId) {
        case 'health':
          setHealth(gameEvent.value);
          break;
        case 'mana':
          setMana(gameEvent.value);
          break;
        case 'concentration':
          setConcentration(gameEvent.value);
          break;
        case 'stamina':
          setStamina(gameEvent.value);
          break;
        case 'spirit':
          setSpirit(gameEvent.value);
          break;
      }
    }
  });

  const healthStatusBar = useMemo((): ReactElement => {
    return (
      <GameStatusBar
        title="Health"
        value={health}
        fillColor="#750E21"
        textColor={euiTheme.colors.text}
      />
    );
  }, [health, euiTheme]);

  const manaStatusBar = useMemo((): ReactElement => {
    return (
      <GameStatusBar
        title="Mana"
        value={mana}
        fillColor="#4477CE"
        textColor={euiTheme.colors.text}
      />
    );
  }, [mana, euiTheme]);

  const concentrationStatusBar = useMemo((): ReactElement => {
    return (
      <GameStatusBar
        title="Concentration"
        value={concentration}
        fillColor="#19376D"
        textColor={euiTheme.colors.text}
      />
    );
  }, [concentration, euiTheme]);

  const staminaStatusBar = useMemo((): ReactElement => {
    return (
      <GameStatusBar
        title="Stamina"
        value={stamina}
        fillColor="#006A67"
        textColor={euiTheme.colors.text}
      />
    );
  }, [stamina, euiTheme]);

  const spiritStatusBar = useMemo((): ReactElement => {
    return (
      <GameStatusBar
        title="Spirit"
        value={spirit}
        fillColor="#6A1E55"
        textColor={euiTheme.colors.text}
      />
    );
  }, [spirit, euiTheme]);

  const statusBars = useMemo((): ReactElement => {
    return (
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          padding: '5px',
          gap: '5px',
        }}
      >
        {healthStatusBar}
        {manaStatusBar}
        {concentrationStatusBar}
        {staminaStatusBar}
        {spiritStatusBar}
      </div>
    );
  }, [
    healthStatusBar,
    manaStatusBar,
    concentrationStatusBar,
    staminaStatusBar,
    spiritStatusBar,
  ]);

  return statusBars;
};

GameStatusBars.displayName = 'GameStatusBars';

interface GameStatusBarProps {
  title: string;
  value: number;
  fillColor: string;
  textColor: string;
}

const GameStatusBar: React.FC<GameStatusBarProps> = (
  props: GameStatusBarProps
): ReactNode => {
  const { title, value, textColor } = props;

  const { euiTheme } = useEuiTheme();

  const { isConnected } = useContext(GameContext);

  const fillColor = isConnected ? props.fillColor : euiTheme.colors.disabled;

  return (
    <div
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        position: 'relative',
        width: '100%',
        height: '25px',
        border: euiTheme.border.thin,
        borderColor: fillColor,
        borderRadius: euiTheme.border.radius.small,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: `${value}%`,
          height: '100%',
          backgroundColor: fillColor,
          // borderColor: fillColor,
          // borderRadius: euiTheme.border.radius.small,
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
        {title} {value}%
      </div>
    </div>
  );
};

GameStatusBar.displayName = 'GameStatusBar';
