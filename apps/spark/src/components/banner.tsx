import { ColorModeToggle } from '@/components/buttons/colorModeToggle';
import { BANNER_HEIGHT } from '@/features/grid/gridConfig';
import { fonts } from '@/styles/fonts';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const Banner = () => (
  <Box
    component='header'
    sx={[
      shadowSx('md'),
      (theme) => ({
        position: 'relative',
        height: BANNER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colours.cream,
        ...theme.applyStyles('dark', { bgcolor: colours.navy }),
      }),
    ]}
  >
    <Typography
      component='h1'
      sx={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 500, letterSpacing: '0.08em' }}
    >
      Trading App
    </Typography>
    <ColorModeToggle />
  </Box>
);
