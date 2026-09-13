import { ApiError, apiFetch, type ApiRequest } from '@/connections/api';
import type { User } from '@/store/authSlice';
import {
  isOrderOpen,
  type Order,
  type OrderChanges,
  type OrderDraft,
  type OrdersPage,
} from '@/store/ordersSlice';
import type { SettingsState } from '@/store/settingsSlice';
import type { Widget } from '@/store/widgetsSlice';

export type FakeApiState = {
  orders: Order[];
  settings: SettingsState;
  widgets: Widget[];
  user: User;
  /** Bearer token the fake accepts; the login and register calls hand it out. */
  token: string;
};

export type FakeApi = {
  state: FakeApiState;
  /** Every request seen, oldest first. */
  calls: { path: string; request: ApiRequest }[];
  /** Makes the next matching requests fail with this error. */
  failWith: (error: ApiError | null) => void;
  handle: typeof apiFetch;
};

const DEFAULTS: FakeApiState = {
  orders: [],
  settings: { updateIntervalMs: 1000, streaming: true },
  widgets: [],
  user: { id: 1, username: 'tester' },
  token: 'fake-token',
};

let nextId = 0;

/** Mirrors `OrderFilter::fromQuery` in apps/api: every param optional, lists comma-separated. */
const filterOrders = (orders: Order[], query: URLSearchParams) => {
  const list = (key: string) => query.get(key)?.split(',') ?? null;
  const number = (key: string) => (query.has(key) ? Number(query.get(key)) : null);
  const [productId, side, statuses, types] = [query.get('productId'), query.get('side'), list('status'), list('type')];
  const [minPrice, maxPrice, from, to] = [number('minPrice'), number('maxPrice'), number('from'), number('to')];
  return orders.filter(
    (order) =>
      (productId === null || order.productId === productId) &&
      (side === null || order.side === side) &&
      (statuses === null || statuses.includes(order.status)) &&
      (types === null || types.includes(order.type)) &&
      (minPrice === null || order.price >= minPrice) &&
      (maxPrice === null || order.price <= maxPrice) &&
      (from === null || order.placedAt >= from) &&
      (to === null || order.placedAt <= to),
  );
};

/** Mirrors `Orders::list` + `Paging::fromQuery`: filter, newest first, then the page window. */
const pageOrders = (orders: Order[], query: URLSearchParams): OrdersPage => {
  const matching = filterOrders(orders, query).sort(
    (a, b) => b.placedAt - a.placedAt || b.id.localeCompare(a.id),
  );
  const pageSize = Number(query.get('pageSize') ?? 10);
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.min(Number(query.get('page') ?? 1), pageCount);
  const start = (page - 1) * pageSize;
  return { items: matching.slice(start, start + pageSize), page, pageCount, total: matching.length };
};

/** In-memory stand-in for `apps/api`, mirroring its routes, ids and status codes. */
export const createFakeApi = (overrides: Partial<FakeApiState> = {}): FakeApi => {
  const state: FakeApiState = { ...DEFAULTS, ...overrides };
  const calls: FakeApi['calls'] = [];
  let failure: ApiError | null = null;

  const route = (fullPath: string, request: ApiRequest): unknown => {
    const method = request.method ?? 'GET';
    const body = request.body as never;
    const [path, queryString] = fullPath.split('?');
    const query = new URLSearchParams(queryString ?? '');
    const [, resource, id, action] = path.split('/');
    switch (resource) {
      case 'auth': {
        if (id === 'me') return state.user;
        if (id === 'logout') return undefined;
        const { username } = body as { username: string };
        return { token: state.token, user: { ...state.user, username } };
      }
      case 'orders': {
        if (id === 'products') return [...new Set(state.orders.map((order) => order.productId))].sort();
        if (method === 'GET') return pageOrders(state.orders, query);
        if (method === 'POST' && id === undefined) {
          const draft = body as OrderDraft;
          const order: Order = {
            ...draft,
            id: `fake-${nextId++}`,
            filledSize: 0,
            status: 'pending',
            placedAt: Date.now(),
          };
          state.orders.push(order);
          return order;
        }
        const index = state.orders.findIndex((order) => order.id === id);
        if (index === -1) throw new ApiError(404, 'Order not found');
        if (!isOrderOpen(state.orders[index])) throw new ApiError(409, 'Order is no longer open');
        const changes: Partial<Order> =
          action === 'cancel' ? { status: 'cancelled' } : (body as OrderChanges);
        state.orders[index] = { ...state.orders[index], ...changes, updatedAt: Date.now() };
        return state.orders[index];
      }
      case 'settings':
        if (method === 'PUT') state.settings = body as SettingsState;
        return { ...state.settings };
      case 'widgets':
        if (method === 'PUT') state.widgets = body as Widget[];
        return [...state.widgets];
      default:
        throw new ApiError(404, 'Not found');
    }
  };

  const handle = (async (path: string, request: ApiRequest = {}) => {
    calls.push({ path, request });
    if (failure !== null) throw failure;
    await Promise.resolve();
    return route(path, request);
  }) as typeof apiFetch;

  return {
    state,
    calls,
    failWith: (error) => {
      failure = error;
    },
    handle,
  };
};
