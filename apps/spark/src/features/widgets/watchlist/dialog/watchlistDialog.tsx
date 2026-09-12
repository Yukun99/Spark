import { ConfirmDialog } from '@/components/dialogs/confirmDialog';

export type WatchlistDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

/** Placeholder until watchlist editing is designed. */
export const WatchlistDialog = ({ onConfirm, onCancel }: WatchlistDialogProps) => (
  <ConfirmDialog open title='Edit watchlist' onConfirm={onConfirm} onCancel={onCancel} />
);
