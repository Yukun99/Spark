import type { TradeSide } from '@/connections/coinbase';
import { GLOW_FADE_MS } from '@/features/widgets/freshnessGlow';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { formatPrice, formatSize } from '@/features/widgets/instrument/tickerFormat';
import { formatDateTime, formatFill } from '@/features/widgets/orders/orderFormat';
import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderType } from '@/store/ordersSlice';
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
  /** Set for orders placed moments ago so the row flashes; the glow is keyed on it. */
  glowAt?: number;
  order: Order;
};

type OrdersDialogKind = 'delete' | 'copy' | null;

export type UseOrdersWidgetResult = {
  title: string;
  rows: OrderRow[];
  dialog: OrdersDialogKind;
  /** Order the copy dialog was opened from; only meaningful while `dialog` is 'copy'. */
  copying: Order | null;
  openDelete: () => void;
  openCopy: (row: OrderRow) => void;
  closeDialog: () => void;
  confirmDelete: () => void;
};

const orderRow = (order: Order, index: number): OrderRow => ({
  key: `${order.placedAt}-${index}`,
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
  glowAt: Date.now() - order.placedAt < GLOW_FADE_MS ? order.placedAt : undefined,
  order,
});

export const useOrdersWidget = (widget: OrdersWidget): UseOrdersWidgetResult => {
  const { orders } = useOrders();
  const { removeWidget } = useWidgets();
  const [dialog, setDialog] = useState<OrdersDialogKind>(null);
  const [copying, setCopying] = useState<Order | null>(null);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openCopy = useCallback((row: OrderRow) => {
    setCopying(row.order);
    setDialog('copy');
  }, []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const confirmDelete = useCallback(() => {
    setDialog(null);
    removeWidget(widget.id);
  }, [removeWidget, widget.id]);

  const rows = useMemo(() => [...orders].reverse().map(orderRow), [orders]);

  return { title: 'Orders', rows, dialog, copying, openDelete, openCopy, closeDialog, confirmDelete };
};
