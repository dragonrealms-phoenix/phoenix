import { EuiText, useEuiTheme } from '@elastic/eui';
import { type SerializedStyles, css } from '@emotion/react';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import type { GameLogLine, GameStreamStyle } from '../../types/game.types.jsx';

export interface GameStreamTextProps {
  logLine: GameLogLine;
  style?: GameStreamStyle;
}

const ignores = [/^(xObvious exits:).*$/];

const substitutions = [
  {
    regex: /exchanges ((a few|some) words)/,
    replacement: 'growls $1',
  },
];

const highlights = [
  {
    regex: /^((Obvious exits:|Obvious paths:).+)$/,
    color: '#FFD200',
  },
  {
    regex: /(^(Also here:)|^(Also in the room:)|(\bYou also see ).*)/,
    color: '#FF6347',
  },
  {
    regex:
      /(([\s\w-']*) (asks|exclaims|says|thinks|yells|swears|signs|gurgles|declares|announces|responds|states|hisses|belts out)( to)?([\s\w-']*), )["']/,
    color: '#00DF00',
  },
  {
    regex: /^(\[?(Roundtime|Round time).*)$/,
    color: '#FF6600',
  },
];

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
      if (logLine.style?.outputClass === 'mono') {
        fontSize = euiTheme.size.m;
        fontFamily = euiTheme.font.familyCode ?? fontFamily;
      }

      // TODO add presets to user customizations in game stream style
      if (logLine.style?.stylePreset === 'roomName') {
        foregroundColor = euiTheme.colors.title;
        fontWeight = euiTheme.font.weight.bold;
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

    const richText = useMemo(() => {
      let lines = logLine.text.split('\n');

      // TODO apply ignores
      lines = lines.filter((line) => {
        return !ignores.some((regex) => regex.test(line));
      });

      // TODO apply substitutions
      substitutions.forEach(({ regex, replacement }) => {
        lines = lines.map((line) => {
          return line.replace(regex, replacement);
        });
      });

      // TODO apply highlights
      highlights.forEach(({ regex, color }) => {
        lines = lines.map((line) => {
          const match = line.match(regex);

          if (!match) {
            return line;
          }

          return line.replace(
            match[1],
            `<span style="color: ${color};">${match[1]}</span>`
          );
        });
      });

      return lines.join('\n');
    }, [logLine.text]);

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

  const { eventId: oldEventId, style: oldTheme } = oldLogLine;
  const { eventId: newEventId, style: newTheme } = newLogLine;

  const isSameEventId = oldEventId === newEventId;
  const isSameColorMode = oldTheme?.colorMode === newTheme?.colorMode;

  return isSameEventId && isSameColorMode;
};

GameStreamText.displayName = 'GameStreamText';
