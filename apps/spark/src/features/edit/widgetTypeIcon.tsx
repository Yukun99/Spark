import { TRAY_ICON_PX } from '@/features/edit/trayConfig';
import type { WidgetType } from '@/features/widgets/widgetSizes';
import { theme as colours } from '@/styles/palette';
import ArticleIcon from '@mui/icons-material/Article';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export type WidgetTypeIconProps = {
  type: WidgetType;
};

const BADGE_PX = 10;
/** Badge glyphs span ~18/24 of their box, so this draws them about 8px across. */
const BADGE_ICON_PX = 10;

const iconSx = { fontSize: TRAY_ICON_PX, display: 'block' } as const;
const badgeIconSx = { fontSize: BADGE_ICON_PX, display: 'block' } as const;

type BadgeProps = { children: ReactNode };

/** Tray-coloured circle pinned to the main icon's bottom-right corner, cutting into it. */
const Badge = ({ children }: BadgeProps) => (
  <Box
    sx={(theme) => ({
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: BADGE_PX,
      height: BADGE_PX,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: colours.cream,
      ...theme.applyStyles('dark', { bgcolor: colours.navy }),
    })}
  >
    {children}
  </Box>
);

/** Icon for each widget type: an eye with a one or article badge, or a plain bullet list for orders. */
export const WidgetTypeIcon = ({ type }: WidgetTypeIconProps) => {
  if (type === 'orders') return <FormatListBulletedIcon sx={iconSx} />;

  return (
    <Box sx={{ position: 'relative', width: TRAY_ICON_PX, height: TRAY_ICON_PX }}>
      <VisibilityIcon sx={iconSx} />
      <Badge>
        {type === 'instrument' ? (
          <LooksOneIcon sx={badgeIconSx} />
        ) : (
          <ArticleIcon sx={badgeIconSx} />
        )}
      </Badge>
    </Box>
  );
};
