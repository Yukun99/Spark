import { FilledButton } from '@/components/buttons/filledButton';
import type { TradeSide } from '@/connections/coinbase';
import { theme as colours, trade } from '@/styles/palette';
import Box, { type BoxProps } from '@mui/material/Box';
import type { MouseEvent } from 'react';

export type TradeButtonsProps = {
  onTrade?: (side: TradeSide) => void;
  sx?: BoxProps['sx'];
};

const SIDES: TradeSide[] = ['buy', 'sell'];
const LABELS: Record<TradeSide, string> = { buy: 'BUY', sell: 'SELL' };
const BUTTON_FONT_PX = 12;

/** BUY on green and SELL on red, side by side; clicks stay off the card. */
export const TradeButtons = ({ onTrade, sx }: TradeButtonsProps) => (
  <Box sx={[{ display: 'flex', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {SIDES.map((side) => (
      <FilledButton
        key={side}
        size='small'
        data-side={side}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onTrade?.(side);
        }}
        sx={(theme) => ({
          flex: '1 1 0',
          width: 'auto',
          minWidth: 0,
          fontSize: BUTTON_FONT_PX,
          bgcolor: trade[side].light,
          color: colours.navy,
          '&:hover': { bgcolor: trade[side].light },
          ...theme.applyStyles('dark', {
            bgcolor: trade[side].dark,
            color: colours.cream,
            '&:hover': { bgcolor: trade[side].dark },
          }),
        })}
      >
        {LABELS[side]}
      </FilledButton>
    ))}
  </Box>
);
