import { ColorModeToggle } from '@/components/buttons/colorModeToggle';
import { BANNER_HEIGHT } from '@/features/grid/gridConfig';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';

export const Banner = () => (
  <Box
    component='header'
    sx={[
      shadowSx('md'),
      (theme) => ({
        position: 'relative',
        height: BANNER_HEIGHT,
        bgcolor: colours.cream,
        ...theme.applyStyles('dark', { bgcolor: colours.navy }),
      }),
    ]}
  >
    <ColorModeToggle />
  </Box>
);
