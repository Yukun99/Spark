import { ClearButton } from '@/components/buttons/clearButton';
import type { CoinbaseProduct } from '@/connections/coinbase';
import { filterProducts } from '@/features/widgets/instrument/dialog/instrumentSearchField';
import type { ReorderHandleProps } from '@/features/widgets/watchlist/dialog/hooks/useRowReorder';
import type { WatchlistRow } from '@/features/widgets/watchlist/dialog/hooks/useWatchlistDialog';
import { gray, theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import type { CSSProperties, Ref } from 'react';

export type WatchlistRowFieldProps = {
  row: WatchlistRow;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  /** Drag handle handlers; omitted on the trailing blank row, which keeps the slot for alignment. */
  handle: ReorderHandleProps | null;
  dragging: boolean;
  products: CoinbaseProduct[];
  loading: boolean;
  error: string | null;
  onInput: (input: string) => void;
  onSelect: (productId: string) => void;
  onBlur: () => void;
  onRemove: () => void;
};

const REMOVE_ICON_PX = 16;
const REMOVE_SLOT_PX = 28;
const HANDLE_ICON_PX = 20;

/** Dragged row in the dialog's paper colour so it covers the rows it passes over. */
const draggedRowSx = (theme: Theme) => ({
  bgcolor: colours.cream,
  ...theme.applyStyles('dark', { bgcolor: colours.navy }),
});

/** Compact free-text instrument search; the typed text is kept so it can be flagged on blur. */
export const WatchlistRowField = ({
  row,
  ref,
  style,
  handle,
  dragging,
  products,
  loading,
  error,
  onInput,
  onSelect,
  onBlur,
  onRemove,
}: WatchlistRowFieldProps) => {
  return (
    <Stack
      ref={ref}
      style={style}
      direction='row'
      spacing={0.5}
      sx={[
        { alignItems: 'center', borderRadius: 1 },
        ...(dragging ? [shadowSx('md'), draggedRowSx] : []),
      ]}
    >
      <Box
        aria-label={handle === null ? undefined : `Reorder ${row.productId ?? row.input}`}
        role={handle === null ? undefined : 'button'}
        {...handle}
        sx={{
          width: HANDLE_ICON_PX,
          flexShrink: 0,
          display: 'flex',
          color: gray[50],
          cursor: handle === null ? undefined : dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        {handle !== null && <DragIndicatorIcon sx={{ fontSize: HANDLE_ICON_PX }} />}
      </Box>
      <Autocomplete
        freeSolo
        forcePopupIcon
        disableClearable
        autoHighlight
        openOnFocus
        fullWidth
        size='small'
        options={products}
        loading={loading}
        inputValue={row.input}
        onInputChange={(_, input, reason) => {
          if (reason !== 'reset') onInput(input);
        }}
        onChange={(_, product) => {
          if (product !== null && typeof product !== 'string') onSelect(product.id);
        }}
        onBlur={onBlur}
        getOptionLabel={(product) => (typeof product === 'string' ? product : product.id)}
        filterOptions={filterProducts}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder='Search instruments'
            error={row.invalid || error !== null}
            helperText={error ?? undefined}
            margin='none'
          />
        )}
      />
      <Box sx={{ width: REMOVE_SLOT_PX, flexShrink: 0 }}>
        {(row.productId !== null || row.input.trim() !== '') && (
          <ClearButton
            rounded
            aria-label={`Remove ${row.productId ?? row.input}`}
            onClick={onRemove}
            sx={{ p: 0.5 }}
          >
            <CloseIcon sx={{ fontSize: REMOVE_ICON_PX }} />
          </ClearButton>
        )}
      </Box>
    </Stack>
  );
};
