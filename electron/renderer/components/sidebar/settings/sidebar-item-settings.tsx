import type { EuiThemeColorMode } from '@elastic/eui';
import {
  EuiCallOut,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiRadioGroup,
  EuiSpacer,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import { useTheme } from '../../../hooks/theme.jsx';

export const SidebarItemSettings: React.FC = (): ReactNode => {
  const { colorMode, setColorMode } = useTheme();

  return (
    <EuiPanel>
      <EuiCallOut title="Settings" iconType="gear" size="s">
        Customize your Phoenix experience.
      </EuiCallOut>

      <EuiSpacer size="m" />

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
  );
};

SidebarItemSettings.displayName = 'SidebarItemSettings';
