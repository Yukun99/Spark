import { FilledButton } from '@/components/buttons/filledButton';
import { OutlinedButton } from '@/components/buttons/outlinedButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { ReactNode } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export const ConfirmDialog = ({
  open,
  title,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onCancel} fullWidth maxWidth='xs'>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      <OutlinedButton onClick={onCancel}>Cancel</OutlinedButton>
      <FilledButton onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </FilledButton>
    </DialogActions>
  </Dialog>
);
