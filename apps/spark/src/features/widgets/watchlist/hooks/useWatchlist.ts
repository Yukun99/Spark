import type { TradeSide } from '@/connections/coinbase';
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
  /** Set while the order dialog replaces the details dialog for `detailsProductId`. */
  orderSide: TradeSide | null;
  openDelete: () => void;
  openModify: () => void;
  openDetails: (productId: string) => void;
  openOrder: (side: TradeSide) => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmWatchlist: (settings: WatchlistSettings) => void;
};

export const useWatchlist = (widget: WatchlistWidget): UseWatchlistResult => {
  const { removeWidget, setWatchlist } = useWidgets();
  const [dialog, setDialog] = useState<WatchlistDialogKind>(null);
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);
  const [orderSide, setOrderSide] = useState<TradeSide | null>(null);
  const latestTick = useCoinbaseLatestTick(widget.productIds);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openModify = useCallback(() => setDialog('modify'), []);
  const openDetails = useCallback((productId: string) => setDetailsProductId(productId), []);
  const openOrder = useCallback((side: TradeSide) => setOrderSide(side), []);
  const closeDialog = useCallback(() => {
    setDialog(null);
    setDetailsProductId(null);
    setOrderSide(null);
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
    orderSide,
    openDelete,
    openModify,
    openDetails,
    openOrder,
    closeDialog,
    confirmDelete,
    confirmWatchlist,
  };
};
