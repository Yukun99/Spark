import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { FreshnessGlow } from '@/features/widgets/freshnessGlow';
import { ValueChip, ValueStrip } from '@/features/widgets/valueStrip';
import { useWatchlistRow } from '@/features/widgets/watchlist/hooks/useWatchlistRow';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';

export type WatchlistRowProps = {
  productId: string;
  onOpen: (productId: string) => void;
};

const CAPTION_FONT_PX = 10;

/**
 * Parent grid columns shared by the header and every row:
 * instrument | bid | divider | ask | price | divider | size.
 * Paired value columns are equal so each divider sits at the centre of its pair.
 */
export const WATCHLIST_COLUMNS = 'auto 1fr auto 1fr 1fr auto 1fr';

/** Subgrid row spanning every parent column. */
export const watchlistRowSx = {
  display: 'grid',
  gridColumn: '1 / -1',
  gridTemplateColumns: 'subgrid',
  alignItems: 'center',
  columnGap: 1,
} as const;

/** Cells sit above the glow overlay so the wash only tints the strip behind them. */
const cellSx = { position: 'relative' } as const;
const startSx = { ...cellSx, justifySelf: 'start' } as const;
const endSx = { ...cellSx, justifySelf: 'end' } as const;

export const WatchlistDivider = () => (
  <Box sx={{ alignSelf: 'stretch', width: '1px', bgcolor: gray[50] }} />
);

/**
 * One instrument on a tinted strip; its cells sit on the parent grid so columns line up.
 * Clicking the row opens that instrument's details.
 */
export const WatchlistRow = ({ productId, onOpen }: WatchlistRowProps) => {
  const { bid, ask, price, size, side, updatedAt, tickAt } = useWatchlistRow(productId);
  const onClick = useCallback(() => onOpen(productId), [onOpen, productId]);

  return (
    <ValueStrip
      data-testid='watchlist-row'
      aria-label={`${productId} details`}
      onClick={onClick}
      sx={{ ...watchlistRowSx, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      {tickAt !== undefined && <FreshnessGlow tickAt={tickAt} />}
      <Box
        sx={{ ...startSx, display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 0.25 }}
      >
        <ValueChip>{productId}</ValueChip>
        <Typography sx={{ fontSize: CAPTION_FONT_PX, lineHeight: 1, color: gray[50] }}>
          Last Refresh: {updatedAt}
        </Typography>
      </Box>
      <ValueChip sx={endSx}>{bid}</ValueChip>
      <WatchlistDivider />
      <ValueChip sx={startSx}>{ask}</ValueChip>
      <ValueChip sx={endSx}>{price}</ValueChip>
      <WatchlistDivider />
      <TransactionTypeDisplay side={side} label={size} sx={startSx} />
    </ValueStrip>
  );
};
