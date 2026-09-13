import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  cancelOrder as cancelOrderThunk,
  modifyOrder,
  placeOrder as placeOrderThunk,
  type Order,
  type OrderChanges,
  type OrderDraft,
} from '@/store/ordersSlice';
import { useCallback } from 'react';

export type UseOrdersResult = {
  orders: Order[];
  placeOrder: (draft: OrderDraft) => void;
  modifyOrder: (id: string, changes: OrderChanges) => void;
  cancelOrder: (id: string) => void;
};

/** Failures are reported through the notice snackbar by the thunks, so callers fire and forget. */
export const useOrders = (): UseOrdersResult => {
  const orders = useAppSelector((state) => state.orders.items);
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

  return { orders, placeOrder, modifyOrder: modify, cancelOrder: cancel };
};
