import { useEuiTheme } from '@elastic/eui';
import type { ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import { TextTruncate } from '../text/text-truncate.jsx';

export const GameHands: React.FC = (): ReactNode => {
  const { euiTheme } = useEuiTheme();

  const [leftHand, setLeftHand] = useState<string>('Empty');
  const [rightHand, setRightHand] = useState<string>('Empty');
  const [spell, setSpell] = useState<string>('None');

  useSubscribe('game:event', (gameEvent: GameEvent) => {
    switch (gameEvent.type) {
      case GameEventType.LEFT_HAND:
        setLeftHand(gameEvent.item);
        break;
      case GameEventType.RIGHT_HAND:
        setRightHand(gameEvent.item);
        break;
      case GameEventType.SPELL:
        setSpell(gameEvent.spell);
        break;
    }
  });

  const leftHandCmp = useMemo((): ReactElement => {
    return <GameHand label="Left" value={leftHand} />;
  }, [leftHand]);

  const rightHandCmp = useMemo((): ReactElement => {
    return <GameHand label="Right" value={rightHand} />;
  }, [rightHand]);

  const spellCmp = useMemo((): ReactElement => {
    return <GameHand label="Spell" value={spell} />;
  }, [spell]);

  const handsCmp = useMemo((): ReactElement => {
    return (
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          gap: '5px',
          width: '100%',
          height: '25px',
          fontSize: euiTheme.size.m,
        }}
      >
        {leftHandCmp}
        {rightHandCmp}
        {spellCmp}
      </div>
    );
  }, [leftHandCmp, rightHandCmp, spellCmp, euiTheme]);

  return handsCmp;
};

GameHands.displayName = 'GameHands';

interface GameHandProps {
  label: string;
  value: string;
}

const GameHand: React.FC<GameHandProps> = (props: GameHandProps): ReactNode => {
  const { label, value } = props;

  const { euiTheme } = useEuiTheme();

  return (
    <div
      css={{
        display: 'flex',
        gap: '5px',
        width: '250px',
        height: '100%',
        padding: '5px',
        border: euiTheme.border.thin,
        borderRadius: euiTheme.border.radius.small,
      }}
    >
      <div css={{ userSelect: 'none' }}>
        <b>{label}:</b>
      </div>
      <TextTruncate text={value} />
    </div>
  );
};

GameHand.displayName = 'GameHand';
