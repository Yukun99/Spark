import { STRIP_TEXT_PX } from '@/features/widgets/valueStrip';
import { WatchlistDivider, watchlistRowSx } from '@/features/widgets/watchlist/watchlistRow';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type HeadingProps = { children: string; align?: 'start' | 'end' };

const Heading = ({ children, align = 'start' }: HeadingProps) => (
  <Typography
    sx={{ fontSize: STRIP_TEXT_PX, color: gray[50], whiteSpace: 'nowrap', justifySelf: align }}
  >
    {children}
  </Typography>
);

/** Column titles above the watchlist rows, padded like a row so they line up with its cells. */
export const WatchlistHeader = () => (
  <Box sx={{ ...watchlistRowSx, px: 1 }}>
    <Heading>Instrument</Heading>
    <Heading align='end'>Bid</Heading>
    <WatchlistDivider />
    <Heading>Ask</Heading>
    <Heading align='end'>Price</Heading>
    <WatchlistDivider />
    <Heading>Size</Heading>
  </Box>
);
