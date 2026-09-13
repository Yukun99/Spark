import { ClearButton } from '@/common/components/buttons/clearButton';
import { ConfirmDialog } from '@/common/components/dialogs/confirmDialog';
import { captionProps } from '@/common/components/forms/captionProps';
import { CheckboxRow } from '@/common/components/forms/checkboxRow';
import { RadioRow } from '@/common/components/forms/radioRow';
import {
  ANY_SIDE,
  useOrderFilterDialog,
  type SideChoice,
} from '@/features/widgets/orders/hooks/useOrderFilterDialog';
import { useOrderProducts } from '@/features/widgets/orders/hooks/useOrderProducts';
import { LABEL_FONT_PX, LABEL_LINE_PX } from '@/features/widgets/widgetLabel';
import {
  ORDER_STATUSES,
  ORDER_TYPES,
  type OrderFilter,
  type OrderStatus,
  type OrderType,
} from '@/store/ordersSlice';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export type OrderFilterDialogProps = {
  /** Filter currently applied, shown prefilled so it can be adjusted. */
  initial: OrderFilter;
  onApply: (filter: OrderFilter) => void;
  onClose: () => void;
};

/** 60% of the order form's width; same height so the two dialogs feel related. */
const PAPER_SX = { width: '45vw', minHeight: '75vh' } as const;
const SIDE_OPTIONS = [ANY_SIDE, 'buy', 'sell'] as const satisfies readonly SideChoice[];
const SIDE_LABELS: Record<SideChoice, string> = { any: 'Any', buy: 'Buy', sell: 'Sell' };
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  fulfilling: 'Fulfilling',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};
const TYPE_LABELS: Record<OrderType, string> = { market: 'Market', limit: 'Limit' };
const DATE_FORMAT = 'DD/MM/YYYY';
const DECIMAL = { htmlInput: { inputMode: 'decimal' } } as const;
const RANGE_SX = { display: 'flex', alignItems: 'flex-start', gap: 1 } as const;
/** Sits level with the field text so the range reads "from - to"; captions hang below. */
const RANGE_DASH_SX = { lineHeight: '56px', userSelect: 'none' } as const;

const rangeDash = (
  <Typography aria-hidden sx={RANGE_DASH_SX}>
    -
  </Typography>
);

/** Mounted only while open; confirming sends the filter to the server, unset fields filter nothing. */
export const OrderFilterDialog = ({ initial, onApply, onClose }: OrderFilterDialogProps) => {
  const filter = useOrderFilterDialog({ initial, onApply });
  const { products, loading, error } = useOrderProducts();

  return (
    <ConfirmDialog
      open
      title='Filter Orders'
      maxWidth={false}
      paperSx={PAPER_SX}
      confirmDisabled={!filter.canConfirm}
      onConfirm={filter.confirm}
      onCancel={onClose}
      titleAction={
        <ClearButton
          rounded
          aria-label='Clear filters'
          onClick={filter.clear}
          sx={{ p: 0, width: LABEL_LINE_PX, height: LABEL_LINE_PX }}
        >
          <FilterAltOffIcon sx={{ fontSize: LABEL_FONT_PX }} />
        </ClearButton>
      }
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={1} sx={{ pt: 1 }}>
          <Autocomplete
            autoHighlight
            fullWidth
            options={products}
            loading={loading}
            value={filter.form.productId}
            onChange={(_, productId) => filter.setProductId(productId)}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Instrument'
                error={error !== null}
                helperText={error ?? ' '}
                slotProps={{ ...params.slotProps, ...captionProps(error) }}
              />
            )}
          />
          <RadioRow
            label='Transaction Type'
            value={filter.form.side}
            options={SIDE_OPTIONS}
            labels={SIDE_LABELS}
            onChange={filter.setSide}
          />
          <CheckboxRow
            label='Order Status'
            options={ORDER_STATUSES}
            labels={STATUS_LABELS}
            values={filter.form.statuses}
            onToggle={filter.toggleStatus}
          />
          <CheckboxRow
            label='Price Type'
            options={ORDER_TYPES}
            labels={TYPE_LABELS}
            values={filter.form.types}
            onToggle={filter.toggleType}
          />
          <Box sx={RANGE_SX}>
            <TextField
              fullWidth
              label='Minimum Price'
              value={filter.form.minPrice}
              error={filter.minPriceError !== null}
              helperText={filter.minPriceError ?? ' '}
              onChange={(event) => filter.setMinPrice(event.target.value)}
              slotProps={{ ...DECIMAL, ...captionProps(filter.minPriceError) }}
            />
            {rangeDash}
            <TextField
              fullWidth
              label='Maximum Price'
              value={filter.form.maxPrice}
              error={filter.maxPriceError !== null}
              helperText={filter.maxPriceError ?? ' '}
              onChange={(event) => filter.setMaxPrice(event.target.value)}
              slotProps={{ ...DECIMAL, ...captionProps(filter.maxPriceError) }}
            />
          </Box>
          <Box sx={RANGE_SX}>
            <DatePicker
              label='Submitted From'
              format={DATE_FORMAT}
              value={filter.form.from}
              onChange={filter.setFrom}
              slotProps={{
                textField: { fullWidth: true, helperText: ' ', slotProps: captionProps(null) },
                field: { clearable: true },
              }}
            />
            {rangeDash}
            <DatePicker
              label='Submitted To'
              format={DATE_FORMAT}
              value={filter.form.to}
              onChange={filter.setTo}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: filter.toError !== null,
                  helperText: filter.toError ?? ' ',
                  slotProps: captionProps(filter.toError),
                },
                field: { clearable: true },
              }}
            />
          </Box>
        </Stack>
      </LocalizationProvider>
    </ConfirmDialog>
  );
};
