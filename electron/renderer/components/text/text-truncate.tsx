import type { ReactNode } from 'react';

export interface TextTruncateProps {
  /**
   * Text to potentially truncate.
   */
  text: string;
  /**
   * Max width (pixels) of the text before truncating.
   * By default, truncates based on the width of the parent container.
   */
  maxWidth?: number;
}

export const TextTruncate: React.FC<TextTruncateProps> = (
  props: TextTruncateProps
): ReactNode => {
  const { text, maxWidth } = props;

  return (
    <div
      style={{
        maxWidth,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {text}
    </div>
  );
};

TextTruncate.displayName = 'TextTruncate';
