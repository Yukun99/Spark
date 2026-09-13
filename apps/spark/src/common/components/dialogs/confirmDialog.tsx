import { FilledButton } from '@/common/components/buttons/filledButton';
import { OutlinedButton } from '@/common/components/buttons/outlinedButton';
import Box from '@mui/material/Box';
import Dialog, { type DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Caps the dialog height, e.g. '60vh'; content then scrolls. */
  maxHeight?: string;
  maxWidth?: DialogProps['maxWidth'];
  paperSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  /** Icon button pinned to the title's top-right corner, e.g. a clear-form action. */
  titleAction?: ReactNode;
  children?: ReactNode;
};

const TITLE_ACTION_SX = { position: 'absolute', top: 16, right: 24 } as const;

const toArray = (sx: SxProps<Theme> | undefined) => (Array.isArray(sx) ? sx : [sx]);

export const ConfirmDialog = ({
  open,
  title,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  maxHeight,
  maxWidth = 'xs',
  paperSx,
  contentSx,
  actionsSx,
  titleAction,
  children,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onCancel}
    fullWidth
    maxWidth={maxWidth}
    slotProps={{ paper: { sx: [{ maxHeight }, ...toArray(paperSx)] } }}
  >
    <DialogTitle sx={{ position: 'relative' }}>
      {title}
      {titleAction !== undefined && <Box sx={TITLE_ACTION_SX}>{titleAction}</Box>}
    </DialogTitle>
    <DialogContent sx={[{ '.MuiDialogTitle-root + &': { pt: 1 } }, ...toArray(contentSx)]}>
      {children}
    </DialogContent>
    <DialogActions sx={[{ px: 3, pb: 3, gap: 1 }, ...toArray(actionsSx)]}>
      <OutlinedButton onClick={onCancel}>Cancel</OutlinedButton>
      <FilledButton onClick={onConfirm} disabled={confirmDisabled}>
        Confirm
      </FilledButton>
    </DialogActions>
  </Dialog>
);
