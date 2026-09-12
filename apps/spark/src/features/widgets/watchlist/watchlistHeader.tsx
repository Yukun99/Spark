import { stripHeadingSx } from '@/features/widgets/valueStrip';
import { WatchlistDivider, watchlistRowSx } from '@/features/widgets/watchlist/watchlistRow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type HeadingProps = { children: string; align?: 'start' | 'end' };

const Heading = ({ children, align = 'start' }: HeadingProps) => (
  <Typography sx={{ ...stripHeadingSx, justifySelf: align }}>{children}</Typography>
);

/** Column titles above the watchlist rows, padded like a row so they line up with its cells. */
export const WatchlistHeader = () => (
  <Box sx={{ ...watchlistRowSx, px: 1 }}>
    <Heading>Instrument</Heading>
    <Heading align='end'>Bid Price</Heading>
    <WatchlistDivider />
    <Heading>Ask Price</Heading>
    <Heading align='end'>Last Price</Heading>
    <WatchlistDivider />
    <Heading>Last Size</Heading>
  </Box>
);
