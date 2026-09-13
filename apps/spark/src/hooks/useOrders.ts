import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  applyOrderFilter,
  cancelOrder as cancelOrderThunk,
  fetchOrders,
  goToOrdersPage,
  isOrderFilterActive,
  modifyOrder,
  placeOrder as placeOrderThunk,
  resizeOrdersPage,
  type Order,
  type OrderChanges,
  type OrderDraft,
  type OrderFilter,
} from '@/store/ordersSlice';
import { useCallback } from 'react';

export type UseOrdersResult = {
  /** The current page, newest first. */
  orders: Order[];
  page: number;
  pageCount: number;
  total: number;
  /** Loads another page through the server. */
  goToPage: (page: number) => void;
  /** Tells the store how many rows fit; the list reloads when that changes. */
  setPageSize: (pageSize: number) => void;
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
  const page = useAppSelector((state) => state.orders.page);
  const pageCount = useAppSelector((state) => state.orders.pageCount);
  const total = useAppSelector((state) => state.orders.total);
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
  const goToPage = useCallback((next: number) => void dispatch(goToOrdersPage(next)), [dispatch]);
  const setPageSize = useCallback(
    (pageSize: number) => void dispatch(resizeOrdersPage(pageSize)),
    [dispatch],
  );
  const applyFilter = useCallback(
    (next: OrderFilter) => void dispatch(applyOrderFilter(next)),
    [dispatch],
  );

  return {
    orders,
    page,
    pageCount,
    total,
    goToPage,
    setPageSize,
    placeOrder,
    modifyOrder: modify,
    cancelOrder: cancel,
    refreshOrders,
    filter,
    filterActive: isOrderFilterActive(filter),
    applyFilter,
  };
};
