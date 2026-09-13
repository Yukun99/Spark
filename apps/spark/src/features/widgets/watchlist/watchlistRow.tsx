import { TransactionTypeDisplay } from '@/common/components/transactionTypeDisplay';
import { FreshnessGlow } from '@/features/widgets/freshnessGlow';
import { ValueChip, ValueStrip } from '@/features/widgets/valueStrip';
import { useWatchlistRow } from '@/features/widgets/watchlist/hooks/useWatchlistRow';
import { EMPTY } from '@/features/widgets/instrument/tickerFormat';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import { memo, useCallback, type Ref } from 'react';

export type WatchlistRowProps = {
  productId: string;
  ref?: Ref<HTMLDivElement>;
  onOpen: (productId: string) => void;
};

/** Widest cell contents measured in the browser (px, Inter 12px chips, widest digit 4). */
const INSTRUMENT_MAX_PX = 129;
const PRICE_MAX_PX = 91;
const SIZE_MAX_PX = 110;

/**
 * Parent grid columns shared by the header and every row:
 * instrument | bid | divider | ask | price | divider | size.
 * Value columns share the width in proportion to their widest possible content.
 */
export const WATCHLIST_COLUMNS = `${INSTRUMENT_MAX_PX}fr ${PRICE_MAX_PX}fr auto ${PRICE_MAX_PX}fr ${PRICE_MAX_PX}fr auto ${SIZE_MAX_PX}fr`;

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
 * Clicking the row opens that instrument's details. Renders once: ticks are written into the
 * cells through refs by `useWatchlistRow`, never through a re-render.
 */
export const WatchlistRow = memo(({ productId, ref, onOpen }: WatchlistRowProps) => {
  const { bidRef, askRef, priceRef, sizeRef, glowRef } = useWatchlistRow(productId);
  const onClick = useCallback(() => onOpen(productId), [onOpen, productId]);

  return (
    <ValueStrip
      ref={ref}
      data-testid='watchlist-row'
      aria-label={`${productId} details`}
      onClick={onClick}
      sx={{ ...watchlistRowSx, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      <FreshnessGlow ref={glowRef} hidden />
      <ValueChip sx={startSx}>{productId}</ValueChip>
      <ValueChip ref={bidRef} sx={endSx}>
        {EMPTY}
      </ValueChip>
      <WatchlistDivider />
      <ValueChip ref={askRef} sx={startSx}>
        {EMPTY}
      </ValueChip>
      <ValueChip ref={priceRef} sx={endSx}>
        {EMPTY}
      </ValueChip>
      <WatchlistDivider />
      <TransactionTypeDisplay ref={sizeRef} side={undefined} label={EMPTY} sx={startSx} />
    </ValueStrip>
  );
});
