import { ConfirmDialog } from '@/common/components/dialogs/confirmDialog';
import { CAPTION_BLOCK_PX, captionProps as baseCaptionProps } from '@/common/components/forms/captionProps';
import { RadioRow } from '@/common/components/forms/radioRow';
import type { TradeSide } from '@/connections/coinbase';
import { DetailFields, FIELD_FONT_PX } from '@/features/widgets/instrument/dialog/detailFields';
import {
  usePlaceOrderDialog,
  type EditTarget,
  type OrderTemplate,
} from '@/features/widgets/instrument/dialog/hooks/usePlaceOrderDialog';
import { TradeButtons } from '@/features/widgets/instrument/tradeButtons';
import { ORDER_TYPES, TIME_IN_FORCE_OPTIONS, type OrderType } from '@/store/ordersSlice';
import { gray } from '@/styles/palette';
import { SCROLLBAR_OPTIONS, SCROLLBAR_OVERHANG_PX, scrollbarSx } from '@/styles/scrollbar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export type PlaceOrderDialogProps = {
  productId: string;
  side: TradeSide;
  /** Prefills the form from an existing order. */
  template?: OrderTemplate;
  /** When set, confirming updates this order instead of placing a new one. */
  editing?: EditTarget;
  onClose: () => void;
};

const ORDER_TYPE_LABELS: Record<OrderType, string> = { market: 'Market', limit: 'Limit' };
const TITLE_FONT_PX = FIELD_FONT_PX + 2;
const DETAIL_COLUMNS = 2;
const DECIMAL = { htmlInput: { inputMode: 'decimal' } } as const;
const PAPER_SX = { width: '75vw', minHeight: '75vh' } as const;
const CONTENT_SX = { display: 'flex', gap: 2, pb: 2 } as const;
const FORM_FLEX = 55;
const DETAILS_FLEX = 45;
const divider = <Divider sx={{ borderColor: gray[50] }} />;

/** Decimal keyboard plus the shared caption styling. */
const captionProps = (error: string | null) => ({ ...DECIMAL, ...baseCaptionProps(error) });

/** Mounted only while open; the clicked side seeds the form. Details fill the form's height and scroll. */
export const PlaceOrderDialog = ({
  productId,
  side,
  template,
  editing,
  onClose,
}: PlaceOrderDialogProps) => {
  const order = usePlaceOrderDialog({ productId, side, template, editing, onClose });

  return (
    <ConfirmDialog
      open
      title={order.title}
      maxWidth={false}
      paperSx={PAPER_SX}
      confirmDisabled={!order.canConfirm}
      onConfirm={order.confirm}
      onCancel={onClose}
      contentSx={CONTENT_SX}
    >
      <Stack spacing={1} sx={{ flex: FORM_FLEX, minWidth: 0, pt: 1 }}>
        <TradeButtons
          selected={order.side}
          disabled={order.sideLocked}
          onTrade={order.setSide}
          sx={{ pb: `${CAPTION_BLOCK_PX}px` }}
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
      <Divider orientation='vertical' flexItem sx={{ borderColor: gray[50] }} />
      <Box sx={{ flex: DETAILS_FLEX, minWidth: 0, position: 'relative' }}>
        <Box
          aria-label={`${productId} details`}
          sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pt: 1 }}
        >
          <Typography sx={{ fontSize: TITLE_FONT_PX, fontWeight: 'bold', px: 1, pb: 1 }}>
            {productId}
          </Typography>
          {divider}
          <Box sx={{ flex: '1 1 auto', minHeight: 0, mr: `-${SCROLLBAR_OVERHANG_PX}px`, ...scrollbarSx }}>
            <OverlayScrollbarsComponent defer options={SCROLLBAR_OPTIONS} style={{ height: '100%' }}>
              <Box sx={{ pr: `${SCROLLBAR_OVERHANG_PX}px` }}>
                <DetailFields sections={order.sections} columns={DETAIL_COLUMNS} />
              </Box>
            </OverlayScrollbarsComponent>
          </Box>
        </Box>
      </Box>
    </ConfirmDialog>
  );
};
