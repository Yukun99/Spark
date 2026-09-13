import { stripHeadingSx } from '@/features/widgets/valueStrip';
import { WatchlistDivider, watchlistRowSx } from '@/features/widgets/watchlist/watchlistRow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Ref } from 'react';

type HeadingProps = { children: string; align?: 'start' | 'end' };

const Heading = ({ children, align = 'start' }: HeadingProps) => (
  <Typography sx={{ ...stripHeadingSx, justifySelf: align }}>{children}</Typography>
);

export type WatchlistHeaderProps = { ref?: Ref<HTMLDivElement> };

/** Column titles above the watchlist rows, padded like a row so they line up with its cells. */
export const WatchlistHeader = ({ ref }: WatchlistHeaderProps) => (
  <Box ref={ref} sx={{ ...watchlistRowSx, px: 1 }}>
    <Heading>Instrument</Heading>
    <Heading align='end'>Bid Price</Heading>
    <WatchlistDivider />
    <Heading>Ask Price</Heading>
    <Heading align='end'>Last Price</Heading>
    <WatchlistDivider />
    <Heading>Last Size</Heading>
  </Box>
);
