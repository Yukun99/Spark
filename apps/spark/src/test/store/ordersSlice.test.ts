import { ApiError } from '@/connections/api';
import {
  applyOrderFilter,
  applyOrderSort,
  cancelOrder,
  fetchOrders,
  isOrderFilterActive,
  modifyOrder,
  goToOrdersPage,
  nextOrderSort,
  orderFilterQuery,
  orderSortQuery,
  ordersQuery,
  ordersReducer,
  orderUpserted,
  placeOrder,
  resizeOrdersPage,
  type OrderDraft,
} from '@/store/ordersSlice';
import { createAppStore } from '@/store/store';
import { installFakeApi } from '@/test/fixtures/mockApi';
import { manyOrders, sampleOrders, sampleOrdersPage, seedOrders } from '@/test/fixtures/orders';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

const draft: OrderDraft = {
  productId: 'BTC-USD',
  side: 'buy',
  type: 'limit',
  timeInForce: 'GTC',
  price: 100,
  size: 0.5,
  provider: 'Coinbase',
};

const seededStore = () => {
  const fake = installFakeApi({ orders: sampleOrders() });
  const store = createAppStore();
  seedOrders(store);
  return { fake, store };
};

describe('ordersSlice reducers', () => {
  it('starts empty without a page size and takes the fetched page wholesale', () => {
    const initial = ordersReducer(undefined, { type: 'init' });
    expect(initial).toEqual({ items: [], filter: {}, sort: null, page: 1, pageSize: null, pageCount: 1, total: 0 });
    const page = { ...sampleOrdersPage(), page: 2, pageCount: 3, total: 25 };
    const loaded = ordersReducer(initial, fetchOrders.fulfilled(page, 'r'));
    expect(loaded).toMatchObject({ items: page.items, page: 2, pageCount: 3, total: 25 });
    expect(ordersReducer(loaded, fetchOrders.fulfilled(null, 'r'))).toBe(loaded);
  });

  it('upserts by id in place and ignores orders that are not on the page', () => {
    const [first, second] = sampleOrders();
    const one = ordersReducer(undefined, fetchOrders.fulfilled({ items: [first], page: 1, pageCount: 1, total: 1 }, 'r'));
    expect(ordersReducer(one, orderUpserted(second)).items.map((order) => order.id)).toEqual([first.id]);
    const edited = ordersReducer(one, orderUpserted({ ...first, price: 1 }));
    expect(edited.items).toHaveLength(1);
    expect(edited.items[0].price).toBe(1);
  });
});

describe('paging', () => {
  it('puts the page window before the sort and the filter in the query', () => {
    expect(ordersQuery({}, 1, 10)).toBe('?page=1&pageSize=10');
    expect(ordersQuery({ side: 'buy' }, 3, 7)).toBe('?page=3&pageSize=7&side=buy');
    expect(ordersQuery({ side: 'buy' }, 3, 7, { column: 'price', direction: 'desc' })).toBe(
      '?page=3&pageSize=7&sort=price&direction=desc&side=buy',
    );
  });

  it('fetches nothing until a page size is known', async () => {
    const fake = installFakeApi({ orders: sampleOrders() });
    const store = createAppStore();
    await store.dispatch(fetchOrders());
    await store.dispatch(goToOrdersPage(2));
    expect(fake.calls).toEqual([]);
    expect(store.getState().orders.items).toEqual([]);
  });

  it('loads the requested page newest first and adopts the page the server clamps to', async () => {
    const fake = installFakeApi({ orders: manyOrders(25) });
    const store = createAppStore();
    await store.dispatch(resizeOrdersPage(10));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10');
    expect(store.getState().orders).toMatchObject({ page: 1, pageCount: 3, total: 25, pageSize: 10 });
    expect(store.getState().orders.items.map((order) => order.id)[0]).toBe('many-24');

    await store.dispatch(goToOrdersPage(3));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=3&pageSize=10');
    expect(store.getState().orders.items.map((order) => order.id)).toEqual(['many-4', 'many-3', 'many-2', 'many-1', 'many-0']);

    await store.dispatch(goToOrdersPage(9));
    expect(store.getState().orders.page).toBe(3);

    const calls = fake.calls.length;
    await store.dispatch(resizeOrdersPage(10));
    expect(fake.calls).toHaveLength(calls);
    await store.dispatch(resizeOrdersPage(5));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=3&pageSize=5');
    expect(store.getState().orders).toMatchObject({ page: 3, pageCount: 5 });
  });

  it('goes back to the first page when a filter is applied', async () => {
    const fake = installFakeApi({ orders: manyOrders(25) });
    const store = createAppStore();
    await store.dispatch(resizeOrdersPage(10));
    await store.dispatch(goToOrdersPage(2));
    await store.dispatch(applyOrderFilter({ side: 'buy' }));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&side=buy');
    expect(store.getState().orders.page).toBe(1);
    await store.dispatch(goToOrdersPage(2));
    await store.dispatch(applyOrderFilter({}));
    expect(store.getState().orders.page).toBe(1);
  });
});

describe('order filter', () => {
  it('serialises only the set fields, lists comma-joined', () => {
    expect(orderFilterQuery({})).toBe('');
    expect(isOrderFilterActive({})).toBe(false);
    expect(orderFilterQuery({ statuses: [], types: [] })).toBe('');
    const query = orderFilterQuery({
      productId: 'BTC-USD',
      side: 'buy',
      statuses: ['pending', 'fulfilling'],
      types: ['limit'],
      minPrice: 1.5,
      maxPrice: 100,
      from: 1700000000000,
      to: 1700000100000,
    });
    expect(query).toBe(
      '?productId=BTC-USD&side=buy&status=pending%2Cfulfilling&type=limit&minPrice=1.5&maxPrice=100&from=1700000000000&to=1700000100000',
    );
    expect(isOrderFilterActive({ side: 'sell' })).toBe(true);
  });

  it('stores the filter and every later fetch sends it', async () => {
    const { fake, store } = seededStore();
    await store.dispatch(applyOrderFilter({ statuses: ['fulfilled'], side: 'sell' }));
    expect(store.getState().orders.filter).toEqual({ statuses: ['fulfilled'], side: 'sell' });
    expect(store.getState().orders.items.map((order) => order.productId)).toEqual(['LINK-USD', 'XRP-USD']);
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&side=sell&status=fulfilled');

    await store.dispatch(fetchOrders());
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&side=sell&status=fulfilled');
    await store.dispatch(applyOrderFilter({}));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10');
    expect(store.getState().orders.items).toHaveLength(sampleOrders().length);
  });
});

describe('order sort', () => {
  it('cycles a column through ascending, descending and off; another column starts ascending', () => {
    expect(nextOrderSort(null, 'price')).toEqual({ column: 'price', direction: 'asc' });
    expect(nextOrderSort({ column: 'price', direction: 'asc' }, 'price')).toEqual({ column: 'price', direction: 'desc' });
    expect(nextOrderSort({ column: 'price', direction: 'desc' }, 'price')).toBeNull();
    expect(nextOrderSort({ column: 'price', direction: 'desc' }, 'status')).toEqual({ column: 'status', direction: 'asc' });
    expect(orderSortQuery(null)).toBe('');
    expect(orderSortQuery({ column: 'placedAt', direction: 'asc' })).toBe('&sort=placedAt&direction=asc');
  });

  it('stores the sort, restarts from page 1 and sends it with every fetch', async () => {
    const fake = installFakeApi({ orders: manyOrders(25) });
    const store = createAppStore();
    await store.dispatch(resizeOrdersPage(10));
    await store.dispatch(goToOrdersPage(2));
    await store.dispatch(applyOrderSort({ column: 'placedAt', direction: 'asc' }));
    expect(store.getState().orders).toMatchObject({ page: 1, sort: { column: 'placedAt', direction: 'asc' } });
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&sort=placedAt&direction=asc');
    expect(store.getState().orders.items.map((order) => order.id)[0]).toBe('many-0');
    await store.dispatch(fetchOrders());
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&sort=placedAt&direction=asc');
    await store.dispatch(applyOrderSort(null));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10');
    expect(store.getState().orders.items.map((order) => order.id)[0]).toBe('many-24');
  });

  it('sorts by each column with the documented keys and ties broken by insertion order', async () => {
    const orders = sampleOrders();
    const fake = installFakeApi({ orders });
    const store = createAppStore();
    await store.dispatch(resizeOrdersPage(10));
    const ids = () => store.getState().orders.items.map((order) => order.productId);
    const sorted = async (column: Parameters<typeof nextOrderSort>[1], direction: 'asc' | 'desc') => {
      await store.dispatch(applyOrderSort({ column, direction }));
      return ids();
    };
    expect(await sorted('instrument', 'asc')).toEqual([...orders.map((order) => order.productId)].sort());
    expect(await sorted('instrument', 'desc')).toEqual([...orders.map((order) => order.productId)].sort().reverse());
    expect(await sorted('price', 'asc')).toEqual(['DOGE-USD', 'ADA-USD', 'XRP-USD', 'DOT-USD', 'AVAX-USD', 'LINK-USD', 'LTC-USD', 'SOL-USD', 'ETH-USD', 'BTC-USD']);
    expect(await sorted('placedAt', 'asc')).toEqual(orders.map((order) => order.productId));
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10&sort=placedAt&direction=asc');
    // 0% filled: SOL, ADA, DOT (pending, pending, fulfilling), ties by insertion order.
    expect((await sorted('status', 'asc')).slice(0, 3)).toEqual(['SOL-USD', 'ADA-USD', 'DOT-USD']);
    expect((await sorted('status', 'desc')).slice(0, 3)).toEqual(['LINK-USD', 'XRP-USD', 'BTC-USD']);
    // 0% filled: DOT (size 300), ADA (800), SOL (25) → smaller total first.
    expect((await sorted('fulfilment', 'asc')).slice(0, 3)).toEqual(['SOL-USD', 'DOT-USD', 'ADA-USD']);
    expect((await sorted('fulfilment', 'desc')).slice(0, 3)).toEqual(['XRP-USD', 'LINK-USD', 'BTC-USD']);
  });
});

describe('order thunks', () => {
  it('reloads the page after placing so the new order shows on top', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-12T10:00:00Z'));
    const { fake, store } = seededStore();
    const before = store.getState().orders.total;
    await store.dispatch(placeOrder(draft));
    expect(store.getState().orders.total).toBe(before + 1);
    expect(store.getState().orders.items).toHaveLength(10);
    expect(store.getState().orders.items[0]).toEqual({
      ...draft,
      id: expect.any(String),
      filledSize: 0,
      status: 'pending',
      placedAt: Date.parse('2026-09-12T10:00:00Z'),
    });
    expect(fake.calls.at(-2)).toEqual({ path: '/orders', request: { method: 'POST', body: draft } });
    expect(fake.calls.at(-1)?.path).toBe('/orders?page=1&pageSize=10');
    vi.useRealTimers();
  });

  it('applies edits at once, then keeps the server version', async () => {
    const { fake, store } = seededStore();
    const target = store.getState().orders.items.find((order) => order.status === 'fulfilling')!;
    const changes = { type: 'limit', timeInForce: 'FOK', price: 5, size: 9 } as const;
    const pending = store.dispatch(modifyOrder({ id: target.id, changes }));
    expect(store.getState().orders.items.find((order) => order.id === target.id)).toEqual({
      ...target,
      ...changes,
      updatedAt: expect.any(Number),
    });
    await pending;
    expect(store.getState().orders.items.find((order) => order.id === target.id)).toEqual(
      fake.state.orders.find((order) => order.id === target.id),
    );
    expect(fake.calls.at(-1)).toEqual({
      path: `/orders/${target.id}`,
      request: { method: 'PATCH', body: changes },
    });
  });

  it('cancels at once and restores the order with a notice when the server refuses', async () => {
    const { fake, store } = seededStore();
    const target = store.getState().orders.items.find((order) => order.status === 'pending')!;
    fake.failWith(new ApiError(409, 'Order is no longer open'));
    const pending = store.dispatch(cancelOrder(target.id));
    expect(store.getState().orders.items.find((order) => order.id === target.id)?.status).toBe('cancelled');
    await pending;
    expect(store.getState().orders.items.find((order) => order.id === target.id)).toEqual(target);
    expect(store.getState().notice.message).toBe('Order is no longer open');
  });

  it('replaces the list on fetch and reports a failed fetch', async () => {
    const { fake, store } = seededStore();
    const { id } = fake.state.orders[0];
    fake.state.orders[0] = { ...fake.state.orders[0], filledSize: 1, status: 'fulfilling' };
    await store.dispatch(fetchOrders());
    expect(store.getState().orders.items.find((order) => order.id === id)).toMatchObject({ filledSize: 1, status: 'fulfilling' });

    fake.failWith(new ApiError(500, 'Internal server error'));
    await store.dispatch(fetchOrders());
    expect(store.getState().notice.message).toBe('Internal server error');
  });

  it('clears the whole session on a 401', async () => {
    const { fake, store } = seededStore();
    fake.failWith(new ApiError(401, 'Invalid or expired token'));
    await store.dispatch(placeOrder(draft));
    expect(store.getState().orders).toMatchObject({ items: [], pageSize: null });
    expect(store.getState().auth.status).toBe('signedOut');
    expect(store.getState().notice.message).toBeNull();
  });
});
