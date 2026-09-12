import { useCoinbaseLatestTick } from '@/connections/hooks/useCoinbaseLatestTick';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { formatTime } from '@/features/widgets/instrument/tickerFormat';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { useCallback, useState } from 'react';

type WatchlistDialogKind = 'delete' | 'modify' | null;

export type UseWatchlistResult = {
  title: string;
  updatedAt: string;
  productIds: string[];
  dialog: WatchlistDialogKind;
  detailsProductId: string | null;
  openDelete: () => void;
  openModify: () => void;
  openDetails: (productId: string) => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmWatchlist: (settings: WatchlistSettings) => void;
};

export const useWatchlist = (widget: WatchlistWidget): UseWatchlistResult => {
  const { removeWidget, setWatchlist } = useWidgets();
  const [dialog, setDialog] = useState<WatchlistDialogKind>(null);
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);
  const latestTick = useCoinbaseLatestTick(widget.productIds);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openModify = useCallback(() => setDialog('modify'), []);
  const openDetails = useCallback((productId: string) => setDetailsProductId(productId), []);
  const closeDialog = useCallback(() => {
    setDialog(null);
    setDetailsProductId(null);
  }, []);
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
    updatedAt: formatTime(latestTick),
    productIds: widget.productIds,
    dialog,
    detailsProductId,
    openDelete,
    openModify,
    openDetails,
    closeDialog,
    confirmDelete,
    confirmWatchlist,
  };
};
