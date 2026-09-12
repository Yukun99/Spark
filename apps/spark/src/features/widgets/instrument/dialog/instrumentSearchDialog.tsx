import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import type { CoinbaseProduct } from '@/connections/coinbase';
import { useCoinbaseProducts } from '@/connections/hooks/useCoinbaseProducts';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

const MAX_SUGGESTIONS = 5;

export type InstrumentSearchDialogProps = {
  productId: string;
  onConfirm: (productId: string) => void;
  onCancel: () => void;
};

/** Products whose id starts with the typed text, alphabetical, capped at five. */
const filterProducts = (options: CoinbaseProduct[], { inputValue }: { inputValue: string }) => {
  const query = inputValue.trim().toUpperCase();
  return options.filter((product) => product.id.startsWith(query)).slice(0, MAX_SUGGESTIONS);
};

/** Mounted only while open, so `productId` seeds the initial selection. */
export const InstrumentSearchDialog = ({
  productId,
  onConfirm,
  onCancel,
}: InstrumentSearchDialogProps) => {
  const { products, loading, error } = useCoinbaseProducts();
  const [selected, setSelected] = useState<string | null>(productId);
  const value = products.find((product) => product.id === selected) ?? null;

  return (
    <ConfirmDialog
      open
      title='Choose instrument'
      confirmDisabled={selected === null}
      onConfirm={() => selected && onConfirm(selected)}
      onCancel={onCancel}
    >
      <Autocomplete
        autoHighlight
        openOnFocus
        options={products}
        loading={loading}
        value={value}
        onChange={(_, product) => setSelected(product?.id ?? null)}
        getOptionLabel={(product) => product.id}
        isOptionEqualToValue={(option, current) => option.id === current.id}
        filterOptions={filterProducts}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            onFocus={(event) => event.target.select()}
            label='Search instruments'
            error={error !== null}
            helperText={error ?? undefined}
            margin='dense'
          />
        )}
      />
    </ConfirmDialog>
  );
};
