import { ApiError } from '@/connections/api';
import {
  applyOrderFilter,
  cancelOrder,
  fetchOrders,
  isOrderFilterActive,
  modifyOrder,
  orderFilterQuery,
  ordersReducer,
  orderUpserted,
  placeOrder,
  replaceOrders,
  type OrderDraft,
} from '@/store/ordersSlice';
import { createAppStore } from '@/store/store';
import { installFakeApi } from '@/test/fixtures/mockApi';
import { sampleOrders } from '@/test/fixtures/orders';

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
  store.dispatch(replaceOrders(sampleOrders()));
  return { fake, store };
};

describe('ordersSlice reducers', () => {
  it('starts empty and replaces the list wholesale', () => {
    expect(ordersReducer(undefined, { type: 'init' }).items).toEqual([]);
    const orders = sampleOrders();
    expect(ordersReducer(undefined, replaceOrders(orders)).items).toBe(orders);
  });

  it('upserts by id, appending unknown orders', () => {
    const [first, second] = sampleOrders();
    const one = ordersReducer(undefined, orderUpserted(first));
    const two = ordersReducer(one, orderUpserted(second));
    expect(two.items.map((order) => order.id)).toEqual([first.id, second.id]);
    const edited = ordersReducer(two, orderUpserted({ ...first, price: 1 }));
    expect(edited.items).toHaveLength(2);
    expect(edited.items[0].price).toBe(1);
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
    expect(store.getState().orders.items.map((order) => order.productId)).toEqual(['XRP-USD', 'LINK-USD']);
    expect(fake.calls.at(-1)?.path).toBe('/orders?side=sell&status=fulfilled');

    await store.dispatch(fetchOrders());
    expect(fake.calls.at(-1)?.path).toBe('/orders?side=sell&status=fulfilled');
    await store.dispatch(applyOrderFilter({}));
    expect(fake.calls.at(-1)?.path).toBe('/orders');
    expect(store.getState().orders.items).toHaveLength(sampleOrders().length);
  });
});

describe('order thunks', () => {
  it('appends the order the server returns when placing', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-12T10:00:00Z'));
    const { fake, store } = seededStore();
    const before = store.getState().orders.items.length;
    await store.dispatch(placeOrder(draft));
    expect(store.getState().orders.items).toHaveLength(before + 1);
    expect(store.getState().orders.items.at(-1)).toEqual({
      ...draft,
      id: expect.any(String),
      filledSize: 0,
      status: 'pending',
      placedAt: Date.parse('2026-09-12T10:00:00Z'),
    });
    expect(fake.calls.at(-1)).toEqual({ path: '/orders', request: { method: 'POST', body: draft } });
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
    fake.state.orders[0] = { ...fake.state.orders[0], filledSize: 1, status: 'fulfilling' };
    await store.dispatch(fetchOrders());
    expect(store.getState().orders.items[0]).toMatchObject({ filledSize: 1, status: 'fulfilling' });

    fake.failWith(new ApiError(500, 'Internal server error'));
    await store.dispatch(fetchOrders());
    expect(store.getState().notice.message).toBe('Internal server error');
  });

  it('clears the whole session on a 401', async () => {
    const { fake, store } = seededStore();
    fake.failWith(new ApiError(401, 'Invalid or expired token'));
    await store.dispatch(placeOrder(draft));
    expect(store.getState().orders.items).toEqual([]);
    expect(store.getState().auth.status).toBe('signedOut');
    expect(store.getState().notice.message).toBeNull();
  });
});
