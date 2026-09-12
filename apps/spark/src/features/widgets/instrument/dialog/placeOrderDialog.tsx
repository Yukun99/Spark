import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import type { TradeSide } from '@/connections/coinbase';
import { usePlaceOrderDialog } from '@/features/widgets/instrument/dialog/hooks/usePlaceOrderDialog';
import { TradeButtons } from '@/features/widgets/instrument/tradeButtons';
import { ValueStrip, valueStripSx } from '@/features/widgets/valueStrip';
import { ORDER_TYPES, TIME_IN_FORCE_OPTIONS, type OrderType } from '@/store/ordersSlice';
import { gray, status } from '@/styles/palette';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export type PlaceOrderDialogProps = {
  productId: string;
  side: TradeSide;
  onClose: () => void;
};

const ORDER_TYPE_LABELS: Record<OrderType, string> = { market: 'Market', limit: 'Limit' };
const CAPTION_FONT_PX = 10;
const CAPTION_LINE_PX = 15;
const CAPTION_GAP_PX = 3;
/** Height every row reserves under it so a caption or error never shifts the rows below. */
const CAPTION_BLOCK_PX = CAPTION_LINE_PX + CAPTION_GAP_PX;
const RADIO_LABEL_PX = 14;
const DECIMAL = { htmlInput: { inputMode: 'decimal' } } as const;
const PAPER_SX = { width: '75vw', minHeight: '75vh' } as const;
const CONTENT_SX = { display: 'flex', gap: 2, pb: 2 } as const;
const FORM_FLEX = 55;
const DETAILS_FLEX = 45;
const actionsSx = (theme: Theme) => ({ ...valueStripSx(theme), mx: 3, mb: 3 });

/** Caption under a field: gray for hints, red for errors; always rendered so rows keep their height. */
const captionProps = (error: string | null) => ({
  ...DECIMAL,
  formHelperText: {
    sx: (theme: Theme) => ({
      fontSize: CAPTION_FONT_PX,
      lineHeight: `${CAPTION_LINE_PX}px`,
      mt: `${CAPTION_GAP_PX}px`,
      mx: 0,
      color: error === null ? gray[50] : status.error.light,
      ...theme.applyStyles('dark', { color: error === null ? gray[50] : status.error.dark }),
    }),
  },
});

type RadioRowProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  onChange: (value: T) => void;
};

const RadioRow = <T extends string>({ label, value, options, labels, onChange }: RadioRowProps<T>) => (
  <FormControl sx={{ pb: `${CAPTION_BLOCK_PX}px` }}>
    <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>
    <RadioGroup row value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          value={option}
          control={<Radio size='small' />}
          label={labels?.[option] ?? option}
          slotProps={{ typography: { sx: { fontSize: RADIO_LABEL_PX } } }}
        />
      ))}
    </RadioGroup>
  </FormControl>
);

/** Mounted only while open; the clicked side seeds the form. The right panel fills in later. */
export const PlaceOrderDialog = ({ productId, side, onClose }: PlaceOrderDialogProps) => {
  const order = usePlaceOrderDialog({ productId, side, onClose });

  return (
    <ConfirmDialog
      open
      title='Place Order'
      maxWidth={false}
      paperSx={PAPER_SX}
      confirmDisabled={!order.canConfirm}
      onConfirm={order.confirm}
      onCancel={onClose}
      contentSx={CONTENT_SX}
      actionsSx={actionsSx}
    >
      <ValueStrip sx={{ flex: FORM_FLEX, minWidth: 0, width: 'auto', p: 2 }}>
        <Stack spacing={1} sx={{ pt: 1 }}>
          <TradeButtons selected={order.side} onTrade={order.setSide} sx={{ pb: `${CAPTION_BLOCK_PX}px` }} />
          <TextField
            fullWidth
            disabled
            label='Instrument'
            value={productId}
            helperText=' '
            slotProps={captionProps(null)}
          />
          <TextField
            fullWidth
            disabled
            label='Provider'
            value={order.provider}
            helperText=' '
            slotProps={captionProps(null)}
          />
          <RadioRow
            label='Order Type'
            value={order.type}
            options={ORDER_TYPES}
            labels={ORDER_TYPE_LABELS}
            onChange={order.setType}
          />
          <TextField
            fullWidth
            label='Price'
            value={order.price}
            disabled={order.type === 'market'}
            error={order.priceError !== null}
            helperText={order.priceError ?? ' '}
            onChange={(event) => order.setPrice(event.target.value)}
            slotProps={captionProps(order.priceError)}
          />
          <TextField
            fullWidth
            label='Size'
            value={order.size}
            error={order.sizeError !== null}
            helperText={order.sizeError ?? `Estimated Order Value: ${order.estimatedValue}`}
            onChange={(event) => order.setSize(event.target.value)}
            slotProps={captionProps(order.sizeError)}
          />
          <RadioRow
            label='Time In Force'
            value={order.timeInForce}
            options={TIME_IN_FORCE_OPTIONS}
            onChange={order.setTimeInForce}
          />
        </Stack>
      </ValueStrip>
      <ValueStrip sx={{ flex: DETAILS_FLEX, minWidth: 0, width: 'auto' }} />
    </ConfirmDialog>
  );
};
