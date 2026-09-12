import { theme as colours, gray } from '@/styles/palette';
import Box, { type BoxProps } from '@mui/material/Box';
import type { SystemStyleObject } from '@mui/system';
import type { Theme } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const STRIP_TEXT_PX = 12;

/** Column heading above widget table rows: bold, slightly larger than cell text. */
export const stripHeadingSx = {
  fontSize: STRIP_TEXT_PX + 2,
  fontWeight: 'bold',
  color: gray[50],
  whiteSpace: 'nowrap',
} as const;

/** Tinted, rounded surface that widget value rows (and other panels) sit on. */
export const valueStripSx = (theme: Theme): SystemStyleObject<Theme> => ({
  p: 1,
  borderRadius: '3px',
  bgcolor: gray[20],
  ...theme.applyStyles('dark', { bgcolor: gray[70] }),
});

/** Full-width tinted strip that widget value rows sit on. */
export const ValueStrip = ({ sx, ...props }: BoxProps) => (
  <Box
    {...props}
    sx={[(theme) => ({ width: '100%', ...valueStripSx(theme) }), ...(Array.isArray(sx) ? sx : [sx])]}
  />
);

/** Value on a chip in the card colour so it stands out from the strip. */
export const ValueChip = ({ sx, ...props }: TypographyProps) => (
  <Typography
    {...props}
    sx={[
      (theme) => ({
        fontSize: STRIP_TEXT_PX,
        px: 0.75,
        borderRadius: '3px',
        bgcolor: colours.cream,
        ...theme.applyStyles('dark', { bgcolor: colours.navy }),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
