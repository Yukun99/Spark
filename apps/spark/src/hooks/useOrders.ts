import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  applyOrderFilter,
  cancelOrder as cancelOrderThunk,
  fetchOrders,
  isOrderFilterActive,
  modifyOrder,
  placeOrder as placeOrderThunk,
  type Order,
  type OrderChanges,
  type OrderDraft,
  type OrderFilter,
} from '@/store/ordersSlice';
import { useCallback } from 'react';

export type UseOrdersResult = {
  orders: Order[];
  placeOrder: (draft: OrderDraft) => void;
  modifyOrder: (id: string, changes: OrderChanges) => void;
  cancelOrder: (id: string) => void;
  /** Reloads the list from the server, picking up simulated fills. */
  refreshOrders: () => void;
  filter: OrderFilter;
  filterActive: boolean;
  /** Stores the filter and reloads the list through the server. */
  applyFilter: (filter: OrderFilter) => void;
};

/** Failures are reported through the notice snackbar by the thunks, so callers fire and forget. */
export const useOrders = (): UseOrdersResult => {
  const orders = useAppSelector((state) => state.orders.items);
  const filter = useAppSelector((state) => state.orders.filter);
  const dispatch = useAppDispatch();
  const placeOrder = useCallback(
    (draft: OrderDraft) => void dispatch(placeOrderThunk(draft)),
    [dispatch],
  );
  const modify = useCallback(
    (id: string, changes: OrderChanges) => void dispatch(modifyOrder({ id, changes })),
    [dispatch],
  );
  const cancel = useCallback((id: string) => void dispatch(cancelOrderThunk(id)), [dispatch]);
  const refreshOrders = useCallback(() => void dispatch(fetchOrders()), [dispatch]);
  const applyFilter = useCallback(
    (next: OrderFilter) => void dispatch(applyOrderFilter(next)),
    [dispatch],
  );

  return {
    orders,
    placeOrder,
    modifyOrder: modify,
    cancelOrder: cancel,
    refreshOrders,
    filter,
    filterActive: isOrderFilterActive(filter),
    applyFilter,
  };
};
