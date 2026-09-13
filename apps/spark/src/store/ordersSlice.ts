import { apiFetch } from '@/connections/api';
import type { TradeSide } from '@/connections/coinbase';
import { reportApiFailure } from '@/store/apiFailure';
import type { RootState } from '@/store/store';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

/** Server-side filter for the list; unset fields don't filter. Times are epoch ms. */
export type OrderFilter = {
  productId?: string;
  side?: TradeSide;
  statuses?: OrderStatus[];
  types?: OrderType[];
  minPrice?: number;
  maxPrice?: number;
  from?: number;
  to?: number;
};

export const isOrderFilterActive = (filter: OrderFilter) =>
  Object.values(filter).some((value) => value !== undefined);

/** Query string for `GET /orders`, empty when nothing is set; the API does the filtering. */
export const orderFilterQuery = (filter: OrderFilter): string => {
  const params = new URLSearchParams();
  if (filter.productId !== undefined) params.set('productId', filter.productId);
  if (filter.side !== undefined) params.set('side', filter.side);
  if (filter.statuses !== undefined && filter.statuses.length > 0) params.set('status', filter.statuses.join(','));
  if (filter.types !== undefined && filter.types.length > 0) params.set('type', filter.types.join(','));
  if (filter.minPrice !== undefined) params.set('minPrice', String(filter.minPrice));
  if (filter.maxPrice !== undefined) params.set('maxPrice', String(filter.maxPrice));
  if (filter.from !== undefined) params.set('from', String(filter.from));
  if (filter.to !== undefined) params.set('to', String(filter.to));
  const query = params.toString();
  return query === '' ? '' : `?${query}`;
};

export type OrdersState = {
  items: Order[];
  filter: OrderFilter;
};

const initialState: OrdersState = { items: [], filter: {} };

const selectOrder = (state: RootState, id: string) =>
  state.orders.items.find((order) => order.id === id);

/** Reloads the list with the stored filter applied server-side. */
export const fetchOrders = createAsyncThunk<Order[], void, { state: RootState }>(
  'orders/fetch',
  async (_, { dispatch, getState }) => {
    try {
      return await apiFetch<Order[]>(`/orders${orderFilterQuery(getState().orders.filter)}`);
    } catch (error) {
      reportApiFailure(dispatch, error, 'Could not refresh orders');
      throw error;
    }
  },
);

export const applyOrderFilter = createAsyncThunk<void, OrderFilter, { state: RootState }>(
  'orders/applyFilter',
  async (filter, { dispatch }) => {
    dispatch(setOrderFilter(filter));
    await dispatch(fetchOrders());
  },
);

export const placeOrder = createAsyncThunk(
  'orders/place',
  async (draft: OrderDraft, { dispatch }) => {
    try {
      return await apiFetch<Order>('/orders', { method: 'POST', body: draft });
    } catch (error) {
      reportApiFailure(dispatch, error, 'Could not place the order');
      throw error;
    }
  },
);

/** Applies the edit at once and restores the previous order if the server rejects it. */
export const modifyOrder = createAsyncThunk<Order, UpdateOrderPayload, { state: RootState }>(
  'orders/modify',
  async ({ id, changes }, { dispatch, getState }) => {
    const previous = selectOrder(getState(), id);
    if (previous !== undefined) {
      dispatch(orderUpserted({ ...previous, ...changes, updatedAt: Date.now() }));
    }
    try {
      return await apiFetch<Order>(`/orders/${id}`, { method: 'PATCH', body: changes });
    } catch (error) {
      if (previous !== undefined) dispatch(orderUpserted(previous));
      reportApiFailure(dispatch, error, 'Could not modify the order');
      throw error;
    }
  },
);

export const cancelOrder = createAsyncThunk<Order, string, { state: RootState }>(
  'orders/cancel',
  async (id, { dispatch, getState }) => {
    const previous = selectOrder(getState(), id);
    if (previous !== undefined) {
      dispatch(orderUpserted({ ...previous, status: 'cancelled', updatedAt: Date.now() }));
    }
    try {
      return await apiFetch<Order>(`/orders/${id}/cancel`, { method: 'POST' });
    } catch (error) {
      if (previous !== undefined) dispatch(orderUpserted(previous));
      reportApiFailure(dispatch, error, 'Could not cancel the order');
      throw error;
    }
  },
);

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    replaceOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    setOrderFilter: (state, action: PayloadAction<OrderFilter>) => {
      state.filter = action.payload;
    },
    /** Replaces the order with the same id in place, or appends it. */
    orderUpserted: (state, action: PayloadAction<Order>) => {
      const index = state.items.findIndex((order) => order.id === action.payload.id);
      if (index === -1) state.items.push(action.payload);
      else state.items[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    for (const thunk of [placeOrder, modifyOrder, cancelOrder]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        ordersSlice.caseReducers.orderUpserted(state, orderUpserted(action.payload));
      });
    }
  },
});

export const { replaceOrders, setOrderFilter, orderUpserted } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
