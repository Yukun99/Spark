import type { TradeSide } from '@/connections/coinbase';
import { trade } from '@/styles/palette';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import type { Ref } from 'react';

export type TransactionTypeDisplayProps = {
  side: TradeSide | undefined;
  /** Text on the chip; defaults to Buy/Sell. Pass e.g. the trade size to keep only the colour. */
  label?: string;
  fontSize?: number;
  sx?: TypographyProps['sx'];
  ref?: Ref<HTMLSpanElement>;
};

const LABELS: Record<TradeSide, string> = { buy: 'Buy', sell: 'Sell' };

/**
 * Buy on green, Sell on red; a bare `--` while no trade has been seen. The colour follows the
 * `data-side` attribute, so it can also be switched without a re-render.
 */
export const TransactionTypeDisplay = ({
  side,
  label,
  fontSize = 12,
  sx,
  ref,
}: TransactionTypeDisplayProps) => (
  <Typography
    component='span'
    ref={ref}
    data-side={side}
    sx={[
      (theme) => ({
        display: 'inline-block',
        fontSize,
        lineHeight: 1.5,
        px: 0.75,
        borderRadius: '3px',
        '&[data-side="buy"]': { bgcolor: trade.buy.light },
        '&[data-side="sell"]': { bgcolor: trade.sell.light },
        ...theme.applyStyles('dark', {
          '&[data-side="buy"]': { bgcolor: trade.buy.dark },
          '&[data-side="sell"]': { bgcolor: trade.sell.dark },
        }),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {label ?? (side === undefined ? '--' : LABELS[side])}
  </Typography>
);
