import type { EuiButtonIconProps } from '@elastic/eui';
import { EuiButtonIcon, EuiPopover, EuiToolTip } from '@elastic/eui';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

export interface SidebarItemProps {
  label: EuiButtonIconProps['aria-label'];
  iconType: EuiButtonIconProps['iconType'];
  iconColor?: EuiButtonIconProps['color'];
  iconSize?: EuiButtonIconProps['iconSize'];
  /**
   * The content of the popover when the button is clicked.
   * Ignored if `onClick` is defined.
   */
  popoverContent?: ReactNode;
  /**
   * Callback to be notified when the button is clicked.
   * Designed when you don't want to use a popover but
   * rather take some other custom action, such as routing.
   * If defined then `popoverContent` is ignored.
   */
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = (
  props: SidebarItemProps
): ReactNode => {
  const { label, iconType, iconColor, iconSize, popoverContent } = props;

  const [showTooltip, setShowTooltip] = useState(true);
  const [showPopover, setShowPopover] = useState(false);

  const onClosePopover = useCallback(() => {
    setShowTooltip(true);
    setShowPopover(false);
  }, []);

  const togglePopoverAndTooltip = useCallback(() => {
    if (!popoverContent) {
      return;
    }
    setShowTooltip((prev) => !prev);
    setShowPopover((prev) => !prev);
  }, [popoverContent]);

  const onClickButton = props.onClick ?? togglePopoverAndTooltip;

  const buttonElmt = (
    <EuiButtonIcon
      onClick={onClickButton}
      aria-label={label}
      iconType={iconType}
      color={iconColor}
      iconSize={iconSize}
      css={{
        minWidth: 50,
        minHeight: 50,
        height: 50,
        width: 50,
      }}
    />
  );

  if (showTooltip) {
    return (
      <EuiToolTip aria-label={label} content={label} position="right">
        {buttonElmt}
      </EuiToolTip>
    );
  }

  if (showPopover) {
    return (
      <EuiPopover
        isOpen={showPopover}
        closePopover={onClosePopover}
        button={buttonElmt}
      >
        {popoverContent}
      </EuiPopover>
    );
  }

  return buttonElmt;
};

SidebarItem.displayName = 'SidebarItem';
