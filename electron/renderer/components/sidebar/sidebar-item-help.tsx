import {
  EuiIcon,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  useEuiBackgroundColor,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  ELANTHIPEDIA_URL,
  PHOENIX_DOCS_URL,
  PHOENIX_ISSUES_URL,
  PHOENIX_LICENSE_URL,
  PHOENIX_PRIVACY_URL,
  PHOENIX_RELEASES_URL,
  PHOENIX_SECURITY_URL,
  PLAY_NET_URL,
} from '../../../common/data/urls';

interface HelpMenuProps {
  items: Array<HelpItemProps>;
}

interface HelpItemProps {
  label: string;
  iconType: string;
  onClick: () => void;
}

const HelpMenu: React.FC<HelpMenuProps> = (props: HelpMenuProps): ReactNode => {
  const { items } = props;

  return (
    <EuiKeyPadMenu>
      {items.map((item) => (
        <HelpItem
          key={item.label}
          label={item.label}
          iconType={item.iconType}
          onClick={item.onClick}
        />
      ))}
    </EuiKeyPadMenu>
  );
};

const HelpItem: React.FC<HelpItemProps> = (props: HelpItemProps): ReactNode => {
  const { label, iconType, onClick } = props;

  return (
    <EuiKeyPadMenuItem
      label={label}
      onClick={onClick}
      css={{
        ':hover': {
          backgroundColor: useEuiBackgroundColor('primary'),
        },
      }}
    >
      <EuiIcon type={iconType} size="l" color="primary" />
    </EuiKeyPadMenuItem>
  );
};

export const SidebarItemHelp: React.FC = (): ReactNode => {
  const helpItems = useMemo<Array<HelpItemProps>>(() => {
    return [
      {
        label: 'Documentation',
        iconType: 'documentation',
        onClick: () => window.open(PHOENIX_DOCS_URL),
      },
      {
        label: 'Release Notes',
        iconType: 'sparkles',
        onClick: () => window.open(PHOENIX_RELEASES_URL),
      },
      {
        label: 'Submit Feedback',
        iconType: 'discuss',
        onClick: () => window.open(PHOENIX_ISSUES_URL),
      },
      {
        label: 'View License',
        iconType: 'document',
        onClick: () => window.open(PHOENIX_LICENSE_URL),
      },
      {
        label: 'Privacy Policy',
        iconType: 'eyeClosed',
        onClick: () => window.open(PHOENIX_PRIVACY_URL),
      },
      {
        label: 'Security Policy',
        iconType: 'lock',
        onClick: () => window.open(PHOENIX_SECURITY_URL),
      },
      {
        label: 'Play.net',
        iconType: 'popout',
        onClick: () => window.open(PLAY_NET_URL),
      },
      {
        label: 'Elanthipedia',
        iconType: 'globe',
        onClick: () => window.open(ELANTHIPEDIA_URL),
      },
    ];
  }, []);

  return <HelpMenu items={helpItems} />;
};
