import { EuiText, useEuiTheme } from '@elastic/eui';
import { type SerializedStyles, css } from '@emotion/react';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import type { GameLogLine } from '../../types/game.types.jsx';

export interface GameStreamTextProps {
  logLine: GameLogLine;
}

/**
 * We memoize the component per the event id because the log lines
 * are effectively immutable. This prevents unnecessary re-renders.
 *
 * One exception is when the theme color mode changes, at which point
 * we do rerender all the log lines to apply the new styling effects.
 */
export const GameStreamText: React.FC<GameStreamTextProps> = memo(
  (props: GameStreamTextProps): ReactNode => {
    const { logLine } = props;

    const { euiTheme } = useEuiTheme();

    const textStyles = useMemo((): SerializedStyles => {
      let fontSize = euiTheme.size.m;
      let fontFamily: string | undefined = 'Verdana'; //euiTheme.font.familySerif;
      let fontWeight = euiTheme.font.weight.regular;
      let fontColor = euiTheme.colors.text;

      if (logLine.styles?.outputClass === 'mono') {
        fontFamily = euiTheme.font.familyCode;
        fontSize = euiTheme.size.m;
      }

      if (logLine.styles?.stylePreset === 'roomName') {
        fontColor = euiTheme.colors.title;
        fontWeight = euiTheme.font.weight.bold;
      }

      if (logLine.styles?.bold === true) {
        fontWeight = euiTheme.font.weight.bold;
      }

      if (logLine.styles?.subdued === true) {
        fontColor = euiTheme.colors.subduedText;
      }

      const textStyles = css({
        fontSize,
        fontFamily,
        fontWeight,
        color: fontColor,
        lineHeight: 'initial',
        paddingLeft: euiTheme.size.s,
        paddingRight: euiTheme.size.s,
      });

      return textStyles;
    }, [euiTheme, logLine.styles]);

    // We output the text using inner html because the text may contain tags.
    // For example, tags to highlight a single word or phrases.
    // If we output as `{logLine.text}` then those tags are escaped.

    return (
      <EuiText id={logLine.eventId} css={textStyles}>
        <span dangerouslySetInnerHTML={{ __html: logLine.text }} />
      </EuiText>
    );
  },
  (oldProps, newProps) => {
    // Component will only rerender when this method returns false.
    return isSameLogLine({
      oldLogLine: oldProps.logLine,
      newLogLine: newProps.logLine,
    });
  }
);

/**
 * For efficient memoization of the log lines, consider the log line the
 * same if the event id and color mode are the same.
 *
 * Checking the color mode ensures that when the user changes the theme
 * then all log lines are re-rendered. Otherwise the stream displays a
 * mix of light and dark mode text, which is unintuitive and confusing.
 */
const isSameLogLine = (options: {
  oldLogLine: GameLogLine;
  newLogLine: GameLogLine;
}): boolean => {
  const { oldLogLine, newLogLine } = options;

  const { eventId: oldEventId, styles: oldTheme } = oldLogLine;
  const { eventId: newEventId, styles: newTheme } = newLogLine;

  const isSameEventId = oldEventId === newEventId;
  const isSameColorMode = oldTheme?.colorMode === newTheme?.colorMode;

  return isSameEventId && isSameColorMode;
};

GameStreamText.displayName = 'GameStreamText';
