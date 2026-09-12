import type { TradeSide } from '@/connections/coinbase';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const ORDER_TYPES = ['market', 'limit'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const TIME_IN_FORCE_OPTIONS = ['GTC', 'IOC', 'FOK'] as const;
export type TimeInForce = (typeof TIME_IN_FORCE_OPTIONS)[number];

/** pending: not yet being worked; fulfilling: being worked, 0% to <100% filled; fulfilled: fully filled. */
export const ORDER_STATUSES = ['pending', 'fulfilling', 'fulfilled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  productId: string;
  side: TradeSide;
  type: OrderType;
  timeInForce: TimeInForce;
  price: number;
  /** Total size requested. */
  size: number;
  /** Size filled so far; completion is `filledSize / size`. */
  filledSize: number;
  status: OrderStatus;
  provider: string;
  placedAt: number;
};

export type OrderDraft = Omit<Order, 'filledSize' | 'status' | 'placedAt'>;

export type OrdersState = {
  items: Order[];
};

const SEED_PLACED_AT = Date.UTC(2026, 8, 12, 9, 0, 0);
const MINUTE_MS = 60_000;

type SeedOrder = Omit<Order, 'provider' | 'placedAt'>;

/** Dummy orders across instruments and fill states, one minute apart, until real fills exist. */
const SEED_ORDERS: SeedOrder[] = [
  { productId: 'BTC-USD', side: 'buy', type: 'market', timeInForce: 'GTC', price: 77450.12, size: 0.5, filledSize: 0.5, status: 'fulfilled' },
  { productId: 'ETH-USD', side: 'sell', type: 'limit', timeInForce: 'GTC', price: 2540, size: 2, filledSize: 0.75, status: 'fulfilling' },
  { productId: 'SOL-USD', side: 'buy', type: 'limit', timeInForce: 'IOC', price: 102.5, size: 25, filledSize: 0, status: 'pending' },
  { productId: 'XRP-USD', side: 'sell', type: 'market', timeInForce: 'FOK', price: 1.37, size: 1000, filledSize: 1000, status: 'fulfilled' },
  { productId: 'DOGE-USD', side: 'buy', type: 'limit', timeInForce: 'GTC', price: 0.085, size: 5000, filledSize: 1234.5678, status: 'fulfilling' },
  { productId: 'ADA-USD', side: 'sell', type: 'limit', timeInForce: 'GTC', price: 0.21, size: 800, filledSize: 0, status: 'pending' },
  { productId: 'DOT-USD', side: 'buy', type: 'limit', timeInForce: 'GTC', price: 4.2, size: 300, filledSize: 0, status: 'fulfilling' },
  { productId: 'AVAX-USD', side: 'buy', type: 'market', timeInForce: 'IOC', price: 7.43, size: 120, filledSize: 119.99, status: 'fulfilling' },
  { productId: 'LINK-USD', side: 'sell', type: 'limit', timeInForce: 'FOK', price: 11.58, size: 40, filledSize: 40, status: 'fulfilled' },
];

const initialState: OrdersState = {
  items: SEED_ORDERS.map((order, index) => ({
    ...order,
    provider: 'Coinbase',
    placedAt: SEED_PLACED_AT + index * MINUTE_MS,
  })),
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: {
      reducer: (state, action: PayloadAction<Order>) => {
        state.items.push(action.payload);
      },
      prepare: (draft: OrderDraft) => ({
        payload: { ...draft, filledSize: 0, status: 'pending' as const, placedAt: Date.now() },
      }),
    },
  },
});

export const { addOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
