import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { useWatchlistDialog } from '@/features/widgets/watchlist/dialog/hooks/useWatchlistDialog';
import { WatchlistRowField } from '@/features/widgets/watchlist/dialog/watchlistRowField';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export type WatchlistDialogProps = {
  widget: WatchlistWidget;
  onConfirm: (settings: WatchlistSettings) => void;
  onCancel: () => void;
};

const MAX_HEIGHT = '60vh';
const SCROLLBAR_OPTIONS = { scrollbars: { autoHide: 'leave', autoHideDelay: 400 } } as const;
const CONTENT_SX = { display: 'flex', flexDirection: 'column', overflow: 'hidden' } as const;

/** Mounted only while open, so the widget's name and instruments seed the draft. */
export const WatchlistDialog = ({ widget, onConfirm, onCancel }: WatchlistDialogProps) => {
  const {
    products,
    loading,
    error,
    name,
    setName,
    rows,
    setRowInput,
    selectRow,
    blurRow,
    removeRow,
    canConfirm,
    confirm,
  } = useWatchlistDialog({ widget, onConfirm });

  return (
    <ConfirmDialog
      open
      title='Edit watchlist'
      confirmDisabled={!canConfirm}
      onConfirm={confirm}
      onCancel={onCancel}
      maxHeight={MAX_HEIGHT}
      contentSx={CONTENT_SX}
    >
      <TextField
        autoFocus
        fullWidth
        label='Name'
        value={name}
        onChange={(event) => setName(event.target.value)}
        onFocus={(event) => event.target.select()}
        margin='dense'
      />
      <Divider sx={{ borderColor: gray[50], my: 2 }} />
      <OverlayScrollbarsComponent
        defer
        options={SCROLLBAR_OPTIONS}
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <Stack spacing={0.5}>
          {rows.map((row, index) => (
            <WatchlistRowField
              key={row.key}
              row={row}
              products={products}
              loading={loading}
              error={error}
              onInput={(input) => setRowInput(index, input)}
              onSelect={(productId) => selectRow(index, productId)}
              onBlur={() => blurRow(index)}
              onRemove={() => removeRow(index)}
            />
          ))}
        </Stack>
      </OverlayScrollbarsComponent>
    </ConfirmDialog>
  );
};
