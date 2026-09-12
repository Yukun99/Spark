import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { useCallback, useState } from 'react';

type WatchlistDialogKind = 'delete' | 'modify' | null;

export type UseWatchlistResult = {
  title: string;
  productIds: string[];
  dialog: WatchlistDialogKind;
  openDelete: () => void;
  openModify: () => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmWatchlist: (settings: WatchlistSettings) => void;
};

export const useWatchlist = (widget: WatchlistWidget): UseWatchlistResult => {
  const { removeWidget, setWatchlist } = useWidgets();
  const [dialog, setDialog] = useState<WatchlistDialogKind>(null);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openModify = useCallback(() => setDialog('modify'), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const confirmDelete = useCallback(() => {
    setDialog(null);
    removeWidget(widget.id);
  }, [removeWidget, widget.id]);
  const confirmWatchlist = useCallback(
    (settings: WatchlistSettings) => {
      setDialog(null);
      setWatchlist(widget.id, settings);
    },
    [setWatchlist, widget.id],
  );

  return {
    title: `${widget.name} (${widget.productIds.length})`,
    productIds: widget.productIds,
    dialog,
    openDelete,
    openModify,
    closeDialog,
    confirmDelete,
    confirmWatchlist,
  };
};
