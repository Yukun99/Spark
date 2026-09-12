import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { FreshnessGlow } from '@/features/widgets/freshnessGlow';
import { STRIP_TEXT_PX, ValueChip, ValueStrip } from '@/features/widgets/valueStrip';
import { useWatchlistRow } from '@/features/widgets/watchlist/hooks/useWatchlistRow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type WatchlistRowProps = {
  productId: string;
};

/** Grid columns shared by the header and every row: instrument, bid/ask, price/type. */
export const WATCHLIST_COLUMNS = 'auto 1fr auto';

type ValuePairProps = {
  left: string;
  right: ReactNode;
  justify: 'center' | 'end';
};

/** Cells sit above the glow overlay so the wash only tints the strip behind them. */
const cellSx = { position: 'relative' } as const;

/** Two chips split by a slash, e.g. bid / ask. */
const ValuePair = ({ left, right, justify }: ValuePairProps) => (
  <Box
    sx={{ ...cellSx, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: justify }}
  >
    <ValueChip>{left}</ValueChip>
    <Typography sx={{ fontSize: STRIP_TEXT_PX }}> / </Typography>
    {typeof right === 'string' ? <ValueChip>{right}</ValueChip> : right}
  </Box>
);

/** One instrument on a tinted strip; its cells sit on the parent grid so columns line up. */
export const WatchlistRow = ({ productId }: WatchlistRowProps) => {
  const { bid, ask, price, side, tickAt } = useWatchlistRow(productId);

  return (
    <ValueStrip
      data-testid='watchlist-row'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridColumn: '1 / -1',
        gridTemplateColumns: 'subgrid',
        alignItems: 'center',
        columnGap: 1,
      }}
    >
      {tickAt !== undefined && <FreshnessGlow tickAt={tickAt} />}
      <ValueChip sx={{ ...cellSx, justifySelf: 'start' }}>{productId}</ValueChip>
      <ValuePair left={bid} right={ask} justify='center' />
      <ValuePair left={price} right={<TransactionTypeDisplay side={side} />} justify='end' />
    </ValueStrip>
  );
};
