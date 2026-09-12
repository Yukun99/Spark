import { ColorModeToggle } from '@/components/buttons/colorModeToggle';
import { BANNER_HEIGHT } from '@/features/grid/gridConfig';
import { APP_TITLE, bannerTitleSx } from '@/styles/appShell';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Must match the static shell in `appShell.ts`, which paints this banner before the bundle runs. */
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
    <Typography component='h1' sx={bannerTitleSx}>
      {APP_TITLE}
    </Typography>
    <ColorModeToggle />
  </Box>
);
