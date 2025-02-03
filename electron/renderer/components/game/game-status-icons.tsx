import { EuiIcon, EuiImage, EuiToolTip } from '@elastic/eui';
import type { StaticImageData } from 'next/image.js';
import type React from 'react';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type {
  GameEvent,
  IndicatorGameEvent,
} from '../../../common/game/types.js';
import { GameEventType, IndicatorType } from '../../../common/game/types.js';
import { toTitleCase } from '../../../common/string/string.utils.js';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import ImageDead from './icons/dead.png';
import ImageKneeling from './icons/kneeling.png';
import ImageProne from './icons/prone.png';
import ImageSitting from './icons/sitting.png';
import ImageStanding from './icons/standing.png';

type PostureIndicatorType =
  | IndicatorType.STANDING
  | IndicatorType.KNEELING
  | IndicatorType.SITTING
  | IndicatorType.PRONE;

const POSTURE_IMAGES: Record<string, StaticImageData> = {
  [IndicatorType.STANDING]: ImageStanding,
  [IndicatorType.KNEELING]: ImageKneeling,
  [IndicatorType.SITTING]: ImageSitting,
  [IndicatorType.PRONE]: ImageProne,
};

export const GameStatusIcons: React.FC = (): ReactNode => {
  const [posture, setPosture] = useState<PostureIndicatorType>(
    IndicatorType.STANDING
  );
  const [isBleeding, setIsBleeding] = useState(false);
  const [isStunned, setIsStunned] = useState(false);
  const [isWebbed, setIsWebbed] = useState(false);
  const [isDiseased, setIsDiseased] = useState(false);
  const [isPoisoned, setIsPoisoned] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isInvisible, setIsInvisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const setIndicatorState = useCallback((gameEvent: IndicatorGameEvent) => {
    // For posture, only change state to the one that is active.
    // If a posture is inactive, we continue displaying the last active one.
    // This mitigates a flash of no image while processing multiple events.
    if (gameEvent.active) {
      switch (gameEvent.indicator) {
        case IndicatorType.STANDING:
        case IndicatorType.KNEELING:
        case IndicatorType.SITTING:
        case IndicatorType.PRONE:
          setPosture(gameEvent.indicator);
          break;
      }
    }

    // For all other indicators, it's important if it's active or not.
    switch (gameEvent.indicator) {
      case IndicatorType.DEAD:
        setIsDead(gameEvent.active);
        break;
      case IndicatorType.BLEEDING:
        setIsBleeding(gameEvent.active);
        break;
      case IndicatorType.STUNNED:
        setIsStunned(gameEvent.active);
        break;
      case IndicatorType.WEBBED:
        setIsWebbed(gameEvent.active);
        break;
      case IndicatorType.DISEASED:
        setIsDiseased(gameEvent.active);
        break;
      case IndicatorType.POISONED:
        setIsPoisoned(gameEvent.active);
        break;
      case IndicatorType.INVISIBLE:
        setIsInvisible(gameEvent.active);
        break;
      case IndicatorType.HIDDEN:
        setIsHidden(gameEvent.active);
        break;
      case IndicatorType.JOINED:
        setIsJoined(gameEvent.active);
        break;
    }
  }, []);

  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    switch (gameEvent.type) {
      case GameEventType.INDICATOR:
        setIndicatorState(gameEvent);
        break;
    }
  });

  return (
    <div
      css={{
        display: 'flex',
        gap: '2px',
        alignContent: 'center',
        alignItems: 'center',
      }}
    >
      <GamePostureIcon isDead={isDead} posture={posture} />

      <GameStatusIcon
        active={isBleeding}
        tooltipText="Bleeding"
        iconType="tear"
        iconColor="danger"
      />

      <GameStatusIcon
        active={isStunned}
        tooltipText="Stunned"
        iconType="sparkles"
        iconColor="warning"
      />

      <GameStatusIcon
        active={isWebbed}
        tooltipText="Webbed"
        iconType="bug"
        iconColor=""
      />

      <GameStatusIcon
        active={isDiseased}
        tooltipText="Diseased"
        iconType="temperature"
        iconColor="orange"
      />

      <GameStatusIcon
        active={isPoisoned}
        tooltipText="Poisoned"
        iconType="beaker"
        iconColor="lime"
      />

      <div css={{ paddingLeft: '4px', paddingRight: '3px' }}>
        <GameStatusIcon
          active={isInvisible}
          tooltipText="Invisible"
          iconType="eyeClosed"
          iconColor="success"
        />
      </div>

      <div css={{ paddingLeft: '3px', paddingRight: '4px' }}>
        <GameStatusIcon
          active={isHidden}
          tooltipText="Hidden"
          iconType="reporter"
          iconColor="success"
        />
      </div>

      <GameStatusIcon
        active={isJoined}
        tooltipText="Joined"
        iconType="users"
        iconColor="success"
      />
    </div>
  );
};

GameStatusIcons.displayName = 'GameStatusIcons';

interface GameStatusIconProps {
  active: boolean;
  tooltipText: string;
  iconType: string;
  iconColor: string;
}

const GameStatusIcon: React.FC<GameStatusIconProps> = (
  props: GameStatusIconProps
): ReactNode => {
  const { active, tooltipText, iconType, iconColor } = props;

  const activeIcon = useMemo(() => {
    return (
      <EuiToolTip content={tooltipText} position="top">
        <EuiIcon type={iconType} color={iconColor} size="l" />
      </EuiToolTip>
    );
  }, [iconType, iconColor, tooltipText]);

  const inactiveIcon = useMemo(() => {
    return (
      <EuiToolTip content={`Not ${tooltipText}`} position="top">
        <EuiIcon type={iconType} color="subdued" size="l" />
      </EuiToolTip>
    );
  }, [iconType, tooltipText]);

  const icon = useMemo(() => {
    return active ? activeIcon : inactiveIcon;
  }, [active, activeIcon, inactiveIcon]);

  return icon;
};

GameStatusIcon.displayName = 'GameStatusIcon';

interface GamePostureIconProps {
  isDead: boolean;
  posture: PostureIndicatorType;
}

const GamePostureIcon: React.FC<GamePostureIconProps> = (
  props: GamePostureIconProps
): ReactNode => {
  const { isDead, posture } = props;

  const deadIcon = useMemo(() => {
    return (
      <EuiToolTip content="Dead" position="top">
        <EuiImage src={ImageDead.src} alt="Dead" />
      </EuiToolTip>
    );
  }, []);

  const postureIcon = useMemo(() => {
    return (
      <EuiToolTip content={toTitleCase(posture)} position="top">
        <EuiImage src={POSTURE_IMAGES[posture].src} alt={posture} />
      </EuiToolTip>
    );
  }, [posture]);

  const icon = useMemo(() => {
    return isDead ? deadIcon : postureIcon;
  }, [isDead, deadIcon, postureIcon]);

  return icon;
};

GamePostureIcon.displayName = 'GamePostureIcon';
