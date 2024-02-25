import { EuiText } from '@elastic/eui';
import { memo } from 'react';
import type { GameLogLine } from '../../types/game.types.jsx';

export interface GameStreamTextProps {
  logLine: GameLogLine;
}

/**
 * We memoize the component per the event id because the log lines
 * are effectively immutable. This prevents unnecessary re-renders.
 */
export const GameStreamText: React.FC<GameStreamTextProps> = memo(
  (props: GameStreamTextProps) => {
    const { logLine } = props;

    // We output the text using inner html because the text may contain tags.
    // For example, tags to highlight a single word or phrases.
    // If we output as `{logLine.text}` then those tags are escaped.

    return (
      <EuiText id={logLine.eventId} css={logLine.styles}>
        <span dangerouslySetInnerHTML={{ __html: logLine.text }} />
      </EuiText>
    );
  },
  (oldProps, newProps) => {
    return oldProps.logLine.eventId === newProps.logLine.eventId;
  }
);

GameStreamText.displayName = 'GameStreamText';
