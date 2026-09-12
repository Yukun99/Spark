import type { TradeSide } from '@/connections/coinbase';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { formatPrice, formatSize } from '@/features/widgets/instrument/tickerFormat';
import { formatDateTime, formatFill } from '@/features/widgets/orders/orderFormat';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/store/ordersSlice';
import type { OrdersWidget } from '@/store/widgetsSlice';
import { useCallback, useMemo, useState } from 'react';

/** One table row; cells are plaintext until the columns get their final formatting. */
export type OrderRow = {
  key: string;
  side: TradeSide;
  status: string;
  price: string;
  fulfilment: string;
  timestamp: string;
};

export type UseOrdersWidgetResult = {
  title: string;
  rows: OrderRow[];
  deleting: boolean;
  openDelete: () => void;
  closeDialog: () => void;
  confirmDelete: () => void;
};

const orderRow = (order: Order, index: number): OrderRow => ({
  key: `${order.placedAt}-${index}`,
  side: order.side,
  status: `${order.productId} ${formatFill(order.filledSize, order.size)} ${order.status}`,
  price: `${order.type} ${formatPrice(order.price)}`,
  fulfilment: `${formatSize(order.filledSize)} / ${formatSize(order.size)} ${order.provider}`,
  timestamp: formatDateTime(order.placedAt),
});

export const useOrdersWidget = (widget: OrdersWidget): UseOrdersWidgetResult => {
  const { orders } = useOrders();
  const { removeWidget } = useWidgets();
  const [deleting, setDeleting] = useState(false);

  const openDelete = useCallback(() => setDeleting(true), []);
  const closeDialog = useCallback(() => setDeleting(false), []);
  const confirmDelete = useCallback(() => {
    setDeleting(false);
    removeWidget(widget.id);
  }, [removeWidget, widget.id]);

  const rows = useMemo(() => [...orders].reverse().map(orderRow), [orders]);

  return { title: 'Orders', rows, deleting, openDelete, closeDialog, confirmDelete };
};
