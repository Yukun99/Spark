import { FilledButton } from '@/components/buttons/filledButton';
import { OutlinedButton } from '@/components/buttons/outlinedButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Caps the dialog height, e.g. '60vh'; content then scrolls. */
  maxHeight?: string;
  contentSx?: SxProps<Theme>;
  children?: ReactNode;
};

export const ConfirmDialog = ({
  open,
  title,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  onConfirm,
  onCancel,
  maxHeight,
  contentSx,
  children,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onCancel}
    fullWidth
    maxWidth='xs'
    slotProps={{ paper: { sx: { maxHeight } } }}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={[{ '.MuiDialogTitle-root + &': { pt: 1 } }, ...(Array.isArray(contentSx) ? contentSx : [contentSx])]}>
      {children}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      <OutlinedButton onClick={onCancel}>Cancel</OutlinedButton>
      <FilledButton onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </FilledButton>
    </DialogActions>
  </Dialog>
);
