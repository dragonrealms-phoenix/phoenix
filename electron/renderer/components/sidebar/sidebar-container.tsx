import type { EuiButtonIconProps } from '@elastic/eui';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiToolTip,
} from '@elastic/eui';
import { type ReactNode, useCallback, useState } from 'react';

export interface SidebarContainerProps {
  //
}

export interface SidebarButtonIconProps {
  label: EuiButtonIconProps['aria-label'];
  iconType: EuiButtonIconProps['iconType'];
  iconColor?: EuiButtonIconProps['color'];
  iconSize?: EuiButtonIconProps['iconSize'];
  /**
   * The content of the popover when the button is clicked.
   */
  children?: ReactNode;
}

const SidebarButtonIcon: React.FC<SidebarButtonIconProps> = (
  props: SidebarButtonIconProps
): ReactNode => {
  const { label, iconType, iconColor, iconSize, children } = props;

  const [showTooltip, setShowTooltip] = useState(true);
  const [showPopover, setShowPopover] = useState(false);

  const onClosePopover = useCallback(() => {
    setShowTooltip(true);
    setShowPopover(false);
  }, []);

  const togglePopoverAndTooltip = useCallback(() => {
    if (!children) {
      return;
    }
    setShowTooltip((prev) => !prev);
    setShowPopover((prev) => !prev);
  }, [children]);

  const buttonElmt = (
    <EuiPopover
      isOpen={showPopover}
      closePopover={onClosePopover}
      button={
        <EuiButtonIcon
          aria-label={label}
          iconType={iconType}
          color={iconColor}
          iconSize={iconSize}
          css={{
            'min-width': 50,
            'min-height': 50,
            'height': 50,
            'width': 50,
          }}
          onClick={togglePopoverAndTooltip}
        />
      }
    >
      {children}
    </EuiPopover>
  );

  if (showTooltip) {
    return (
      <EuiToolTip aria-label={label} content={label} position="right">
        {buttonElmt}
      </EuiToolTip>
    );
  }

  return buttonElmt;
};

SidebarButtonIcon.displayName = 'SidebarButtonIcon';

export const SidebarContainer: React.FC<SidebarContainerProps> = (
  props: SidebarContainerProps
): ReactNode => {
  return (
    <EuiFlexGroup direction="column" css={{ height: '100%' }}>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup direction="column" gutterSize="none" alignItems="center">
          <EuiFlexItem grow={false}>
            <SidebarButtonIcon
              label="Characters"
              iconType="user"
              iconColor="primary"
              iconSize="l"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <SidebarButtonIcon
              label="Accounts"
              iconType="key"
              iconColor="primary"
              iconSize="l"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem grow={true}>{/* empty space in the middle */}</EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup direction="column" gutterSize="none" alignItems="center">
          <EuiFlexItem grow={false}>
            <SidebarButtonIcon
              label="Help"
              iconType="questionInCircle"
              iconColor="text"
              iconSize="xl" // https://github.com/elastic/eui/issues/6322
            >
              <div>Some help text</div>
            </SidebarButtonIcon>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <SidebarButtonIcon
              label="Settings"
              iconType="gear"
              iconColor="text"
              iconSize="l"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

SidebarContainer.displayName = 'SidebarContainer';
