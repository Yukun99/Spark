import type { TradeSide } from '@/connections/coinbase';
import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export const ORDER_TYPES = ['market', 'limit'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const TIME_IN_FORCE_OPTIONS = ['GTC', 'IOC', 'FOK'] as const;
export type TimeInForce = (typeof TIME_IN_FORCE_OPTIONS)[number];

/**
 * pending: not yet being worked; fulfilling: being worked, 0% to <100% filled; fulfilled: fully
 * filled; cancelled: stopped by the user, keeping whatever was filled by then.
 */
export const ORDER_STATUSES = ['pending', 'fulfilling', 'fulfilled', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
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
  /** Last time the user modified the order; absent until then. */
  updatedAt?: number;
};

export type OrderDraft = Omit<Order, 'id' | 'filledSize' | 'status' | 'placedAt' | 'updatedAt'>;

/** Fields the user can change on an order that is still being worked; the side is fixed. */
export type OrderChanges = Pick<Order, 'type' | 'timeInForce' | 'price' | 'size'>;

export type UpdateOrderPayload = { id: string; changes: OrderChanges };

/** Moment an order last changed: its edit if any, else its placement. */
export const orderTouchedAt = (order: Pick<Order, 'placedAt' | 'updatedAt'>) =>
  order.updatedAt ?? order.placedAt;

/** Orders still open for editing or cancelling; fulfilled and cancelled ones are final. */
export const isOrderOpen = (order: Pick<Order, 'status'>) =>
  order.status === 'pending' || order.status === 'fulfilling';

export type OrdersState = {
  items: Order[];
};

const SEED_PLACED_AT = Date.UTC(2026, 8, 12, 9, 0, 0);
const MINUTE_MS = 60_000;

type SeedOrder = Omit<Order, 'id' | 'provider' | 'placedAt'>;

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
  { productId: 'LTC-USD', side: 'buy', type: 'limit', timeInForce: 'GTC', price: 68.2, size: 10, filledSize: 3, status: 'cancelled' },
];

const initialState: OrdersState = {
  items: SEED_ORDERS.map((order, index) => ({
    ...order,
    id: nanoid(),
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
        payload: {
          ...draft,
          id: nanoid(),
          filledSize: 0,
          status: 'pending' as const,
          placedAt: Date.now(),
        },
      }),
    },
    updateOrder: {
      reducer: (state, action: PayloadAction<UpdateOrderPayload & { updatedAt: number }>) => {
        const { id, changes, updatedAt } = action.payload;
        const order = state.items.find((item) => item.id === id);
        if (order !== undefined && isOrderOpen(order)) Object.assign(order, changes, { updatedAt });
      },
      prepare: (payload: UpdateOrderPayload) => ({ payload: { ...payload, updatedAt: Date.now() } }),
    },
  },
});

export const { addOrder, updateOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
