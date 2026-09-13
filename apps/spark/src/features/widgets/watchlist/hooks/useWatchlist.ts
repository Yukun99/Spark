import type { TradeSide } from '@/connections/coinbase';
import { usePageSize, type UsePageSizeResult } from '@/features/widgets/hooks/usePageSize';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { useCallback, useMemo, useState } from 'react';

type WatchlistDialogKind = 'delete' | 'modify' | null;

/** Header and row heights in px until the first real ones are measured. */
const SIZE_ESTIMATE = { header: 21, row: 34 };

export type UseWatchlistResult = Pick<UsePageSizeResult, 'containerRef' | 'headerRef' | 'rowRef'> & {
  title: string;
  /** Every instrument, for the last-refresh caption. */
  productIds: string[];
  /** Instruments on the current page, with the index of each in `productIds`. */
  pageRows: { productId: string; index: number }[];
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
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
  const [page, setPage] = useState(1);
  const { containerRef, headerRef, rowRef, pageSize } = usePageSize({ estimate: SIZE_ESTIMATE });

  const { productIds } = widget;
  const rowsPerPage = pageSize ?? 1;
  const pageCount = Math.max(1, Math.ceil(productIds.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return productIds.slice(start, start + rowsPerPage).map((productId, offset) => ({
      productId,
      index: start + offset,
    }));
  }, [currentPage, productIds, rowsPerPage]);

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
    title: `${widget.name} (${productIds.length})`,
    productIds,
    pageRows,
    page: currentPage,
    pageCount,
    setPage,
    containerRef,
    headerRef,
    rowRef,
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
