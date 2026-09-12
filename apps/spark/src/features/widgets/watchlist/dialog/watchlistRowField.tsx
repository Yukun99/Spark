import { ClearButton } from '@/components/buttons/clearButton';
import type { CoinbaseProduct } from '@/connections/coinbase';
import { filterProducts } from '@/features/widgets/instrument/dialog/instrumentSearchField';
import type { WatchlistRow } from '@/features/widgets/watchlist/dialog/hooks/useWatchlistDialog';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export type WatchlistRowFieldProps = {
  row: WatchlistRow;
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

/** Compact free-text instrument search; the typed text is kept so it can be flagged on blur. */
export const WatchlistRowField = ({
  row,
  products,
  loading,
  error,
  onInput,
  onSelect,
  onBlur,
  onRemove,
}: WatchlistRowFieldProps) => {
  return (
    <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
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
