import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { InstrumentSearchField } from '@/features/widgets/instrument/dialog/instrumentSearchField';
import { useWatchlistDialog } from '@/features/widgets/watchlist/dialog/hooks/useWatchlistDialog';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
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
  const { products, loading, error, name, setName, rows, setRow, addRow, canConfirm, confirm } =
    useWatchlistDialog({ widget, onConfirm });

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
            <InstrumentSearchField
              key={index}
              compact
              products={products}
              loading={loading}
              error={error}
              value={row}
              onChange={(productId) => setRow(index, productId)}
            />
          ))}
          <Box
            role='button'
            aria-label='Add instrument'
            onClick={addRow}
            sx={(theme) => ({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 1,
              borderRadius: '3px',
              cursor: 'pointer',
              bgcolor: gray[20],
              ...theme.applyStyles('dark', { bgcolor: gray[80] }),
            })}
          >
            <AddIcon />
          </Box>
        </Stack>
      </OverlayScrollbarsComponent>
    </ConfirmDialog>
  );
};
