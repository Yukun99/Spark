import { STRIP_TEXT_PX } from '@/features/widgets/valueStrip';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const headerSx = { fontSize: STRIP_TEXT_PX, color: gray[50], whiteSpace: 'nowrap' } as const;

/** Column titles above the watchlist rows, padded like a row so they line up with its cells. */
export const WatchlistHeader = () => (
  <Box
    sx={{
      display: 'grid',
      gridColumn: '1 / -1',
      gridTemplateColumns: 'subgrid',
      columnGap: 1,
      px: 1,
    }}
  >
    <Typography sx={headerSx}>Instrument</Typography>
    <Typography sx={{ ...headerSx, textAlign: 'center' }}>Bid / Ask</Typography>
    <Typography sx={{ ...headerSx, textAlign: 'right' }}>Price / Type</Typography>
  </Box>
);
