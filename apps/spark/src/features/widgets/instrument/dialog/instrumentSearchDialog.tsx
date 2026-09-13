import { ConfirmDialog } from '@/common/components/dialogs/confirmDialog';
import { useCoinbaseProducts } from '@/connections/hooks/useCoinbaseProducts';
import { InstrumentSearchField } from '@/features/widgets/instrument/dialog/instrumentSearchField';
import { useState } from 'react';

export type InstrumentSearchDialogProps = {
  productId: string;
  onConfirm: (productId: string) => void;
  onCancel: () => void;
};

/** Mounted only while open, so `productId` seeds the initial selection. */
export const InstrumentSearchDialog = ({
  productId,
  onConfirm,
  onCancel,
}: InstrumentSearchDialogProps) => {
  const { products, loading, error } = useCoinbaseProducts();
  const [selected, setSelected] = useState<string | null>(productId);

  return (
    <ConfirmDialog
      open
      title='Choose instrument'
      confirmDisabled={selected === null}
      onConfirm={() => selected && onConfirm(selected)}
      onCancel={onCancel}
    >
      <InstrumentSearchField
        autoFocus
        products={products}
        loading={loading}
        error={error}
        value={selected}
        onChange={setSelected}
      />
    </ConfirmDialog>
  );
};
