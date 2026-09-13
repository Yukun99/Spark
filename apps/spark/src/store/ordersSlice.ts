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

export const ORDER_SORT_COLUMNS = ['instrument', 'status', 'price', 'fulfilment', 'placedAt'] as const;
export type OrderSortColumn = (typeof ORDER_SORT_COLUMNS)[number];
export type SortDirection = 'asc' | 'desc';

/** Column the server sorts the list by; the keys per column live in `OrderSort.php`. */
export type OrderSort = { column: OrderSortColumn; direction: SortDirection };

/** Next step in a column's click cycle: ascending, descending, off; another column starts afresh. */
export const nextOrderSort = (current: OrderSort | null, column: OrderSortColumn): OrderSort | null => {
  if (current === null || current.column !== column) return { column, direction: 'asc' };
  return current.direction === 'asc' ? { column, direction: 'desc' } : null;
};

/** Query fragment for `GET /orders` starting with `&`, empty when unsorted. */
export const orderSortQuery = (sort: OrderSort | null): string =>
  sort === null ? '' : `&sort=${sort.column}&direction=${sort.direction}`;

/** Query string for `GET /orders`: the page window first, then the sort, then the filter. */
export const ordersQuery = (
  filter: OrderFilter,
  page: number,
  pageSize: number,
  sort: OrderSort | null = null,
): string =>
  `?page=${page}&pageSize=${pageSize}${orderSortQuery(sort)}${orderFilterQuery(filter).replace('?', '&')}`;

/** One page of orders as `GET /orders` returns it, newest first. */
export type OrdersPage = {
  items: Order[];
  page: number;
  pageCount: number;
  total: number;
};

export type OrdersState = {
  /** The current page only. */
  items: Order[];
  filter: OrderFilter;
  /** Column sort applied on the server; null shows newest first. */
  sort: OrderSort | null;
  page: number;
  /** Rows that fit the orders widget; null until it has measured itself, so nothing is fetched. */
  pageSize: number | null;
  pageCount: number;
  total: number;
};

const initialState: OrdersState = {
  items: [],
  filter: {},
  sort: null,
  page: 1,
  pageSize: null,
  pageCount: 1,
  total: 0,
};

const selectOrder = (state: RootState, id: string) =>
  state.orders.items.find((order) => order.id === id);

/** Reloads the current page with the stored filter and sort applied server-side; waits for a page size. */
export const fetchOrders = createAsyncThunk<OrdersPage | null, void, { state: RootState }>(
  'orders/fetch',
  async (_, { dispatch, getState }) => {
    const { filter, sort, page, pageSize } = getState().orders;
    if (pageSize === null) return null;
    try {
      return await apiFetch<OrdersPage>(`/orders${ordersQuery(filter, page, pageSize, sort)}`);
    } catch (error) {
      reportApiFailure(dispatch, error, 'Could not refresh orders');
      throw error;
    }
  },
);

/** Stores the filter and starts over from the first page, so the page can't be out of range. */
export const applyOrderFilter = createAsyncThunk<void, OrderFilter, { state: RootState }>(
  'orders/applyFilter',
  async (filter, { dispatch }) => {
    dispatch(setOrderFilter(filter));
    dispatch(setOrdersPage(1));
    await dispatch(fetchOrders());
  },
);

/** Stores the sort and starts over from the first page, like a filter change. */
export const applyOrderSort = createAsyncThunk<void, OrderSort | null, { state: RootState }>(
  'orders/applySort',
  async (sort, { dispatch }) => {
    dispatch(setOrdersSort(sort));
    dispatch(setOrdersPage(1));
    await dispatch(fetchOrders());
  },
);

export const goToOrdersPage = createAsyncThunk<void, number, { state: RootState }>(
  'orders/goToPage',
  async (page, { dispatch }) => {
    dispatch(setOrdersPage(page));
    await dispatch(fetchOrders());
  },
);

/** Refetches with the rows that now fit; a repeat of the current size is a no-op. */
export const resizeOrdersPage = createAsyncThunk<void, number, { state: RootState }>(
  'orders/resizePage',
  async (pageSize, { dispatch, getState }) => {
    if (getState().orders.pageSize === pageSize) return;
    dispatch(setOrdersPageSize(pageSize));
    await dispatch(fetchOrders());
  },
);

/** A new order lands at the top of page 1 and shifts the rest, so the page is reloaded. */
export const placeOrder = createAsyncThunk<Order, OrderDraft, { state: RootState }>(
  'orders/place',
  async (draft: OrderDraft, { dispatch }) => {
    try {
      const order = await apiFetch<Order>('/orders', { method: 'POST', body: draft });
      await dispatch(fetchOrders());
      return order;
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
    setOrderFilter: (state, action: PayloadAction<OrderFilter>) => {
      state.filter = action.payload;
    },
    setOrdersSort: (state, action: PayloadAction<OrderSort | null>) => {
      state.sort = action.payload;
    },
    setOrdersPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setOrdersPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    /** Replaces the order with the same id in place; orders on other pages are left alone. */
    orderUpserted: (state, action: PayloadAction<Order>) => {
      const index = state.items.findIndex((order) => order.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      if (action.payload === null) return;
      const { items, page, pageCount, total } = action.payload;
      Object.assign(state, { items, page, pageCount, total });
    });
    for (const thunk of [modifyOrder, cancelOrder]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        ordersSlice.caseReducers.orderUpserted(state, orderUpserted(action.payload));
      });
    }
  },
});

export const { setOrderFilter, setOrdersSort, setOrdersPage, setOrdersPageSize, orderUpserted } =
  ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
