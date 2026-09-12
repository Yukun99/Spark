import type { TradeSide } from '@/connections/coinbase';
import { trade } from '@/styles/palette';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export type TransactionTypeDisplayProps = {
  side: TradeSide | undefined;
  fontSize?: number;
  sx?: TypographyProps['sx'];
};

const LABELS: Record<TradeSide, string> = { buy: 'Buy', sell: 'Sell' };

/** Buy on green, Sell on red; a bare `--` while no trade has been seen. */
export const TransactionTypeDisplay = ({ side, fontSize = 12, sx }: TransactionTypeDisplayProps) => (
  <Typography
    component='span'
    data-side={side}
    sx={[
      (theme) => ({
        display: 'inline-block',
        fontSize,
        lineHeight: 1.5,
        px: 0.75,
        borderRadius: '3px',
        ...(side && {
          bgcolor: trade[side].light,
          ...theme.applyStyles('dark', { bgcolor: trade[side].dark }),
        }),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {side === undefined ? '--' : LABELS[side]}
  </Typography>
);
