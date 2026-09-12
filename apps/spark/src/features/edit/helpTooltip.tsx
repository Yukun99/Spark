import { shadowSx } from '@/styles/shadows';
import { theme as colours } from '@/styles/palette';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

export type HelpTooltipProps = {
  title: string;
  /** Panel width in px; defaults to the tray panel width. */
  width?: number;
  /** One paragraph per entry, shown under the title in order. */
  lines: string[];
  children: ReactElement;
};

const DEFAULT_WIDTH_PX = 300;
const PANEL_RADIUS_PX = 3;
const TITLE_FONT_PX = 14;
const BODY_FONT_PX = 12;

const slotProps = (width: number) => ({
  tooltip: {
    sx: [
      shadowSx('xl'),
      (theme: Theme) => ({
        width,
        maxWidth: 'none',
        p: 1.5,
        borderRadius: `${PANEL_RADIUS_PX}px`,
        bgcolor: colours.cream,
        color: colours.navy,
        ...theme.applyStyles('dark', { bgcolor: colours.navy, color: colours.cream }),
      }),
    ],
  },
});

/** Help panel that pops out beside an action button: bold name, then a paragraph per line. */
export const HelpTooltip = ({ title, width = DEFAULT_WIDTH_PX, lines, children }: HelpTooltipProps) => (
  <Tooltip
    placement='left'
    disableInteractive
    slotProps={slotProps(width)}
    title={
      <Stack spacing={0.5}>
        <Typography sx={{ fontSize: TITLE_FONT_PX, fontWeight: 'bold' }}>{title}</Typography>
        {lines.map((line) => (
          <Typography key={line} sx={{ fontSize: BODY_FONT_PX }}>
            {line}
          </Typography>
        ))}
      </Stack>
    }
  >
    {children}
  </Tooltip>
);
