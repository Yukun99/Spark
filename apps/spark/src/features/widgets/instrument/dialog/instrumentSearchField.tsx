import type { CoinbaseProduct } from '@/connections/coinbase';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const MAX_SUGGESTIONS = 5;

export type InstrumentSearchFieldProps = {
  products: CoinbaseProduct[];
  loading: boolean;
  error: string | null;
  value: string | null;
  onChange: (productId: string | null) => void;
  autoFocus?: boolean;
};

/** Products whose id starts with the typed text, alphabetical, capped at five. */
export const filterProducts = (
  options: CoinbaseProduct[],
  { inputValue }: { inputValue: string },
) => {
  const query = inputValue.trim().toUpperCase();
  return options.filter((product) => product.id.startsWith(query)).slice(0, MAX_SUGGESTIONS);
};

/** Full-width prefix search over Coinbase products, selecting one product id. */
export const InstrumentSearchField = ({
  products,
  loading,
  error,
  value,
  onChange,
  autoFocus = false,
}: InstrumentSearchFieldProps) => {
  const selected = products.find((product) => product.id === value) ?? null;

  return (
    <Autocomplete
      autoHighlight
      openOnFocus
      fullWidth
      options={products}
      loading={loading}
      value={selected}
      onChange={(_, product) => onChange(product?.id ?? null)}
      getOptionLabel={(product) => product.id}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      filterOptions={filterProducts}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          onFocus={(event) => event.target.select()}
          label='Search instruments'
          error={error !== null}
          helperText={error ?? undefined}
          margin='dense'
        />
      )}
    />
  );
};
