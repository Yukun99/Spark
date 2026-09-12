import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addOrder,
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
};

export const useOrders = (): UseOrdersResult => {
  const orders = useAppSelector((state) => state.orders.items);
  const dispatch = useAppDispatch();
  const placeOrder = useCallback((draft: OrderDraft) => dispatch(addOrder(draft)), [dispatch]);
  const modifyOrder = useCallback(
    (id: string, changes: OrderChanges) => dispatch(updateOrder({ id, changes })),
    [dispatch],
  );

  return { orders, placeOrder, modifyOrder };
};
