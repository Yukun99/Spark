import type { TradeSide } from '@/connections/coinbase';
import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export const ORDER_TYPES = ['market', 'limit'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const TIME_IN_FORCE_OPTIONS = ['GTC', 'IOC', 'FOK'] as const;
export type TimeInForce = (typeof TIME_IN_FORCE_OPTIONS)[number];

export type Order = {
  id: string;
  productId: string;
  side: TradeSide;
  type: OrderType;
  timeInForce: TimeInForce;
  price: number;
  size: number;
  provider: string;
  /** Exchange time of the tick the price came from. */
  priceAt: number | undefined;
  placedAt: number;
};

export type OrderDraft = Omit<Order, 'id' | 'placedAt'>;

export type OrdersState = {
  items: Order[];
};

const initialState: OrdersState = { items: [] };

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: {
      reducer: (state, action: PayloadAction<Order>) => {
        state.items.push(action.payload);
      },
      prepare: (draft: OrderDraft) => ({ payload: { ...draft, id: nanoid(), placedAt: Date.now() } }),
    },
  },
});

export const { addOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
