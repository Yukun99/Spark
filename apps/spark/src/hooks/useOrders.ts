import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addOrder,
  cancelOrder,
  updateOrder,
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

export const useOrders = (): UseOrdersResult => {
  const orders = useAppSelector((state) => state.orders.items);
  const dispatch = useAppDispatch();
  const placeOrder = useCallback((draft: OrderDraft) => dispatch(addOrder(draft)), [dispatch]);
  const modifyOrder = useCallback(
    (id: string, changes: OrderChanges) => dispatch(updateOrder({ id, changes })),
    [dispatch],
  );

  const cancel = useCallback((id: string) => dispatch(cancelOrder(id)), [dispatch]);

  return { orders, placeOrder, modifyOrder, cancelOrder: cancel };
};
