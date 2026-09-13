import type { TradeSide } from '@/connections/coinbase';
import { GLOW_FADE_MS } from '@/features/widgets/freshnessGlow';
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
  type OrderType,
} from '@/store/ordersSlice';
import type { OrdersWidget } from '@/store/widgetsSlice';
import { useCallback, useMemo, useState } from 'react';

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

export type UseOrdersWidgetResult = {
  title: string;
  rows: OrderRow[];
  deleting: boolean;
  cancelling: boolean;
  filtering: boolean;
  /** Filter currently applied on the server; prefills the filter dialog. */
  filter: OrderFilter;
  filterActive: boolean;
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
  refresh: () => void;
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
  const { orders, cancelOrder, refreshOrders, filter, filterActive, applyFilter } = useOrders();
  const { removeWidget } = useWidgets();
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

  const rows = useMemo(() => [...orders].reverse().map(orderRow), [orders]);
  const form = useMemo(
    () => (selected === null ? null : orderForm(dialog, selected)),
    [dialog, selected],
  );

  return {
    title: 'Orders',
    rows,
    deleting: dialog === 'delete',
    cancelling: dialog === 'cancel',
    filtering: dialog === 'filter',
    filter,
    filterActive,
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
    refresh: refreshOrders,
  };
};
