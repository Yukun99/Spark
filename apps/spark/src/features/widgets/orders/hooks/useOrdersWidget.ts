import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { formatPrice, formatSize, formatTime } from '@/features/widgets/instrument/tickerFormat';
import { formatFill } from '@/features/widgets/orders/orderFormat';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/store/ordersSlice';
import type { OrdersWidget } from '@/store/widgetsSlice';
import { useCallback, useMemo, useState } from 'react';


export type UseOrdersWidgetResult = {
  title: string;
  rows: string[];
  deleting: boolean;
  openDelete: () => void;
  closeDialog: () => void;
  confirmDelete: () => void;
};

const SEPARATOR = ' | ';

/** Every stored field of an order, in slice order, as one plaintext line. */
const orderText = (order: Order) =>
  [
    order.productId,
    order.side,
    order.type,
    order.timeInForce,
    formatPrice(order.price),
    formatSize(order.size),
    formatSize(order.filledSize),
    formatFill(order.filledSize, order.size),
    order.status,
    order.provider,
    formatTime(order.placedAt),
  ].join(SEPARATOR);

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

  const rows = useMemo(() => [...orders].reverse().map(orderText), [orders]);

  return { title: 'Orders', rows, deleting, openDelete, closeDialog, confirmDelete };
};
