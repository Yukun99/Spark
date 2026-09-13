import type { TradeSide } from '@/connections/coinbase';
import { GLOW_FADE_MS } from '@/features/widgets/freshnessGlow';
import { usePageSize, type UsePageSizeResult } from '@/features/widgets/hooks/usePageSize';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { roundSize } from '@/features/widgets/instrument/dialog/orderValidation';
import type { PlaceOrderDialogProps } from '@/features/widgets/instrument/dialog/placeOrderDialog';
import { formatPrice, formatSize } from '@/features/widgets/instrument/tickerFormat';
import { formatDateTime, formatFill } from '@/features/widgets/orders/orderFormat';
import { useOrders } from '@/hooks/useOrders';
import {
  isOrderOpen,
  orderTouchedAt,
  type Order,
  type OrderFilter,
  type OrderSort,
  type OrderSortColumn,
  type OrderType,
} from '@/store/ordersSlice';
import type { OrdersWidget } from '@/store/widgetsSlice';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Header and row heights in px until the first real ones are measured. */
const SIZE_ESTIMATE = { header: 21, row: 60 };

/** Quiet spell after a resize before the page is refetched with the rows that now fit. */
export const PAGE_SIZE_SETTLE_MS = 500;

/** One table row; cells are plaintext until the columns get their final formatting. */
export type OrderRow = {
  key: string;
  instrument: string;
  side: TradeSide;
  status: string;
  /** Filled fraction 0-1 for the progress bar. */
  fill: number;
  fillLabel: string;
  type: OrderType;
  price: string;
  provider: string;
  fulfilment: string;
  timestamp: string;
  /** Set for orders placed or edited moments ago so the row flashes; the glow is keyed on it. */
  glowAt?: number;
  /** Whether the order can still be modified or cancelled. */
  open: boolean;
  order: Order;
};

type OrdersDialogKind = 'delete' | 'copy' | 'edit' | 'cancel' | 'filter' | null;

/** Props for the order form the widget currently shows, minus its close handler. */
export type OrderFormProps = Omit<PlaceOrderDialogProps, 'onClose'>;

export type UseOrdersWidgetResult = Pick<UsePageSizeResult, 'containerRef' | 'headerRef' | 'rowRef'> & {
  /** Widget name for the frame's button labels. */
  name: string;
  /** Card title: the name with the number of orders matching the filter. */
  title: string;
  /** Small line under the title naming the active filter and sort, if any. */
  caption?: string;
  /** The current page in the server's order. */
  rows: OrderRow[];
  page: number;
  pageCount: number;
  goToPage: (page: number) => void;
  deleting: boolean;
  cancelling: boolean;
  filtering: boolean;
  /** Filter currently applied on the server; prefills the filter dialog. */
  filter: OrderFilter;
  /** Column sort applied on the server; null shows newest first. */
  sort: OrderSort | null;
  /** Last order an action was opened on; stays set so a closing dialog keeps its text. */
  selected: Order | null;
  /** Set while copying or editing an order. */
  orderForm: OrderFormProps | null;
  openDelete: () => void;
  openCopy: (row: OrderRow) => void;
  openEdit: (row: OrderRow) => void;
  openCancel: (row: OrderRow) => void;
  openFilter: () => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmCancel: () => void;
  applyFilter: (filter: OrderFilter) => void;
  /** Steps the column through ascending, descending and off. */
  sortBy: (column: OrderSortColumn) => void;
  clearSort: () => void;
  refresh: () => void;
};

const captionFor = (filterActive: boolean, sorted: boolean) => {
  if (filterActive && sorted) return 'Filtered, sorted';
  if (filterActive) return 'Filtered';
  return sorted ? 'Sorted' : undefined;
};

const glowAt = (order: Order) => {
  const touchedAt = orderTouchedAt(order);
  return Date.now() - touchedAt < GLOW_FADE_MS ? touchedAt : undefined;
};

const orderRow = (order: Order): OrderRow => ({
  key: order.id,
  instrument: order.productId,
  side: order.side,
  status: order.status,
  fill: order.size > 0 ? order.filledSize / order.size : 0,
  fillLabel: formatFill(order.filledSize, order.size),
  type: order.type,
  price: formatPrice(order.price),
  provider: order.provider,
  fulfilment: `${formatSize(order.filledSize)} / ${formatSize(order.size)}`,
  timestamp: formatDateTime(order.placedAt),
  glowAt: glowAt(order),
  open: isOrderOpen(order),
  order,
});

/** Copying reuses the order as typed; editing offers only the part not yet filled as the size. */
const orderForm = (kind: OrdersDialogKind, order: Order): OrderFormProps | null => {
  const { productId, side, type, timeInForce, price, filledSize } = order;
  if (kind === 'copy') return { productId, side, template: { type, timeInForce, price, size: order.size } };
  if (kind === 'edit') {
    const size = roundSize(order.size - filledSize);
    return { productId, side, template: { type, timeInForce, price, size }, editing: order };
  }
  return null;
};

export const useOrdersWidget = (widget: OrdersWidget): UseOrdersWidgetResult => {
  const {
    orders,
    page,
    pageCount,
    total,
    goToPage,
    setPageSize,
    cancelOrder,
    refreshOrders,
    filter,
    filterActive,
    applyFilter,
    sort,
    sortBy,
    clearSort,
  } = useOrders();
  const { removeWidget } = useWidgets();
  const { containerRef, headerRef, rowRef, pageSize } = usePageSize({ estimate: SIZE_ESTIMATE });
  const measured = useRef(false);
  useEffect(() => {
    if (pageSize === null) return;
    if (!measured.current) {
      measured.current = true;
      setPageSize(pageSize);
      return;
    }
    const timer = setTimeout(() => setPageSize(pageSize), PAGE_SIZE_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [pageSize, setPageSize]);
  const [dialog, setDialog] = useState<OrdersDialogKind>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openCopy = useCallback((row: OrderRow) => {
    setSelected(row.order);
    setDialog('copy');
  }, []);
  const openEdit = useCallback((row: OrderRow) => {
    setSelected(row.order);
    setDialog('edit');
  }, []);
  const openCancel = useCallback((row: OrderRow) => {
    setSelected(row.order);
    setDialog('cancel');
  }, []);
  const openFilter = useCallback(() => setDialog('filter'), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const confirmFilter = useCallback(
    (next: OrderFilter) => {
      setDialog(null);
      applyFilter(next);
    },
    [applyFilter],
  );
  const confirmDelete = useCallback(() => {
    setDialog(null);
    removeWidget(widget.id);
  }, [removeWidget, widget.id]);
  const confirmCancel = useCallback(() => {
    setDialog(null);
    if (selected !== null) cancelOrder(selected.id);
  }, [cancelOrder, selected]);

  const rows = useMemo(() => orders.map(orderRow), [orders]);
  const form = useMemo(
    () => (selected === null ? null : orderForm(dialog, selected)),
    [dialog, selected],
  );

  return {
    name: 'Orders',
    title: `Orders (${total})`,
    caption: captionFor(filterActive, sort !== null),
    rows,
    page,
    pageCount,
    goToPage,
    containerRef,
    headerRef,
    rowRef,
    deleting: dialog === 'delete',
    cancelling: dialog === 'cancel',
    filtering: dialog === 'filter',
    filter,
    sort,
    selected,
    orderForm: form,
    openDelete,
    openCopy,
    openEdit,
    openCancel,
    openFilter,
    closeDialog,
    confirmDelete,
    confirmCancel,
    applyFilter: confirmFilter,
    sortBy,
    clearSort,
    refresh: refreshOrders,
  };
};
