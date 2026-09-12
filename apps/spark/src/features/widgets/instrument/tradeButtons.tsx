import { FilledButton } from '@/components/buttons/filledButton';
import type { TradeSide } from '@/connections/coinbase';
import { theme as colours, trade } from '@/styles/palette';
import Box, { type BoxProps } from '@mui/material/Box';
import type { MouseEvent } from 'react';

export type TradeButtonsProps = {
  onTrade?: (side: TradeSide) => void;
  /** When set, the other side renders dimmed so the pair works as a toggle. */
  selected?: TradeSide;
  sx?: BoxProps['sx'];
};

const SIDES: TradeSide[] = ['buy', 'sell'];
const LABELS: Record<TradeSide, string> = { buy: 'BUY', sell: 'SELL' };
const BUTTON_FONT_PX = 12;
const UNSELECTED_OPACITY = 0.4;

/** BUY on green and SELL on red, side by side; clicks stay off the card. */
export const TradeButtons = ({ onTrade, selected, sx }: TradeButtonsProps) => (
  <Box sx={[{ display: 'flex', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {SIDES.map((side) => (
      <FilledButton
        key={side}
        size='small'
        data-side={side}
        aria-pressed={selected === undefined ? undefined : selected === side}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onTrade?.(side);
        }}
        sx={(theme) => ({
          flex: '1 1 0',
          width: 'auto',
          minWidth: 0,
          fontSize: BUTTON_FONT_PX,
          opacity: selected === undefined || selected === side ? 1 : UNSELECTED_OPACITY,
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
