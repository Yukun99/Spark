import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addOrder, type Order, type OrderDraft } from '@/store/ordersSlice';
import { useCallback } from 'react';

export type UseOrdersResult = {
  orders: Order[];
  placeOrder: (draft: OrderDraft) => void;
};

export const useOrders = (): UseOrdersResult => {
  const orders = useAppSelector((state) => state.orders.items);
  const dispatch = useAppDispatch();
  const placeOrder = useCallback((draft: OrderDraft) => dispatch(addOrder(draft)), [dispatch]);

  return { orders, placeOrder };
};
