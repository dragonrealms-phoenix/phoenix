import type { EuiThemeColorMode } from '@elastic/eui';
import {
  EuiCallOut,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiRadioGroup,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import { useTheme } from '../../../hooks/theme.jsx';

export const SidebarItemSettings: React.FC = (): ReactNode => {
  const { colorMode, setColorMode } = useTheme();

  return (
    <>
      <EuiPanel paddingSize="none">
        <EuiCallOut title="Settings" iconType="gear" size="s">
          Customize your Phoenix experience.
        </EuiCallOut>

        <EuiPanel paddingSize="s" hasShadow={false}>
          <EuiForm component="form">
            <EuiFormRow label="Appearance">
              <EuiRadioGroup
                name="theme"
                idSelected={colorMode}
                options={[
                  {
                    id: 'light',
                    label: 'Light',
                  },
                  {
                    id: 'dark',
                    label: 'Dark',
                  },
                ]}
                onChange={(themeId: string) => {
                  setColorMode?.(themeId as EuiThemeColorMode);
                }}
              />
            </EuiFormRow>
          </EuiForm>
        </EuiPanel>
      </EuiPanel>
      <HighlightedText
        line="this red fish is as big as a trout"
        indices={[
          [5, 7],
          [20, 22],
        ]}
      />
    </>
  );
};

SidebarItemSettings.displayName = 'SidebarItemSettings';

interface HighlightedTextProps {
  line: string;
  indices: Array<[number, number]>;
}

const HighlightedText: React.FC<HighlightedTextProps> = (
  props: HighlightedTextProps
) => {
  const { line, indices } = props;

  const getHighlightedText = (
    text: string,
    indices: Array<[number, number]>
  ) => {
    const parts: Array<string | JSX.Element> = [];
    let lastIndex = 0;

    indices.forEach(([start, end], index) => {
      // Add the text before the highlighted part
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      // Add the highlighted part
      parts.push(
        <span key={index} css={{ color: 'red' }}>
          {text.slice(start, end + 1)}
        </span>
      );
      lastIndex = end + 1;
    });

    // Add the remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return <span className="magic">{getHighlightedText(line, indices)}</span>;
};
