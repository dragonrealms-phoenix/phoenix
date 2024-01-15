import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
} from '@elastic/eui';
import { type ReactNode, useEffect, useState } from 'react';

export interface GameSettingsProps {
  show: boolean;
  onHide: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = (
  props: GameSettingsProps
): ReactNode => {
  const { show, onHide } = props;

  const [settingsPanel, setSettingsPanel] = useState<ReactNode>(null);

  useEffect(() => {
    if (show) {
      setSettingsPanel(
        <EuiFlyout side="left" onClose={() => onHide()}>
          <EuiFlyoutHeader hasBorder={true}>
            <EuiTitle>
              <h2>Settings</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>stuff here</EuiFlyoutBody>
        </EuiFlyout>
      );
    } else {
      // In order for the flyout overlay to go away then we must
      // remove the flyout from the DOM.
      setSettingsPanel(null);
    }
  }, [show, onHide]);

  return settingsPanel;
};

GameSettings.displayName = 'GameSettings';
