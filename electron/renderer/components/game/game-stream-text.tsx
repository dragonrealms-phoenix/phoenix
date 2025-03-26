import { EuiText, useEuiTheme } from '@elastic/eui';
import { type SerializedStyles, css } from '@emotion/react';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import type { GameLogLine, GameStreamStyle } from '../../types/game.types.jsx';

export interface GameStreamTextProps {
  logLine: GameLogLine;
  style?: GameStreamStyle;
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
    const { logLine, style } = props;

    const { euiTheme } = useEuiTheme();

    const defaultStyles = useMemo(() => {
      const fontSize = style?.fontSize ?? euiTheme.size.m;
      const fontFamily = style?.fontFamily ?? euiTheme.font.family;
      const fontWeight = euiTheme.font.weight.regular;
      const foregroundColor = style?.foregroundColor ?? euiTheme.colors.text;
      const backgroundColor = style?.backgroundColor ?? 'inherit';

      return {
        fontSize,
        fontFamily,
        fontWeight,
        foregroundColor,
        backgroundColor,
      };
    }, [euiTheme, style]);

    const textStyles = useMemo((): SerializedStyles => {
      let fontSize = defaultStyles.fontSize;
      let fontFamily = defaultStyles.fontFamily;
      let fontWeight = defaultStyles.fontWeight;
      let foregroundColor = defaultStyles.foregroundColor;
      const backgroundColor = defaultStyles.backgroundColor;

      // TODO add to user customizations in game stream style
      switch (logLine.style?.outputClass) {
        case 'mono':
          fontSize = euiTheme.size.m;
          fontFamily = euiTheme.font.familyCode ?? fontFamily;
          break;
      }

      // TODO move this to game parser, wrap emitted text in span with class <span class='preset-whispers'>
      // TODO add presets to user customizations in game stream style
      switch (logLine.style?.stylePreset) {
        case 'roomName':
          foregroundColor = euiTheme.colors.title;
          fontWeight = euiTheme.font.weight.bold;
          break;
        case 'whispers':
          foregroundColor = '#65F9E9';
          break;
      }

      if (logLine.style?.bold === true) {
        fontWeight = euiTheme.font.weight.bold;
      }

      if (logLine.style?.subdued === true) {
        foregroundColor = euiTheme.colors.subduedText;
      }

      const textStyles = css({
        fontSize,
        fontFamily,
        fontWeight,
        color: foregroundColor,
        backgroundColor,
        lineHeight: 'initial',
        paddingLeft: euiTheme.size.s,
        paddingRight: euiTheme.size.s,
        b: {
          color: '#FFD200', // TODO add 'monster bold' user customization to game stream style
          fontWeight: euiTheme.font.weight.regular,
        },
      });

      return textStyles;
    }, [euiTheme, defaultStyles, logLine.style]);

    // We use `dangerouslySetInnerHTML` because the text may contain tags.
    // For example, <b> or <a> tags for monsterbold and links.
    // Otherwise those tags are escaped.
    const textNode = useMemo(() => {
      const nodeSegments = new Array<ReactNode>();

      const textSegments = logLine.segments ?? [
        {
          text: logLine.text,
          start: 0,
          end: logLine.text.length,
          backgroundColor: '',
          foregroundColor: '',
        },
      ];

      for (let i = 0; i < textSegments.length; i += 1) {
        const segment = textSegments[i];

        const segmentStyles = css({
          color: segment.foregroundColor || 'inherit',
          backgroundColor: segment.backgroundColor || 'inherit',
        });

        nodeSegments.push(
          <span
            key={i}
            css={segmentStyles}
            dangerouslySetInnerHTML={{ __html: segment.text }}
          />
        );
      }

      return (
        <EuiText id={logLine.eventId} css={textStyles}>
          {nodeSegments}
        </EuiText>
      );
    }, [logLine, textStyles]);

    return textNode;
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

  const { eventId: oldEventId, style: oldTheme } = oldLogLine;
  const { eventId: newEventId, style: newTheme } = newLogLine;

  const isSameEventId = oldEventId === newEventId;
  const isSameColorMode = oldTheme?.colorMode === newTheme?.colorMode;

  return isSameEventId && isSameColorMode;
};

GameStreamText.displayName = 'GameStreamText';
