import { ColorModeToggle } from '@/common/components/buttons/colorModeToggle';
import { AccountName, SignOutButton } from '@/features/auth/accountControls';
import { BANNER_HEIGHT } from '@/features/grid/gridConfig';
import { APP_TITLE, bannerTitleSx } from '@/styles/appShell';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const CONTROLS_SX = { position: 'absolute', top: 24, right: 24, alignItems: 'center', gap: 1 } as const;

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
    <Stack direction='row' sx={CONTROLS_SX}>
      <AccountName />
      <ColorModeToggle />
      <SignOutButton />
    </Stack>
  </Box>
);
