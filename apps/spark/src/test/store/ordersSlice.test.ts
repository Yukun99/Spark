import { ApiError } from '@/connections/api';
import {
  cancelOrder,
  modifyOrder,
  orderUpserted,
  ordersReducer,
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

  it('clears the whole session on a 401', async () => {
    const { fake, store } = seededStore();
    fake.failWith(new ApiError(401, 'Invalid or expired token'));
    await store.dispatch(placeOrder(draft));
    expect(store.getState().orders.items).toEqual([]);
    expect(store.getState().auth.status).toBe('signedOut');
    expect(store.getState().notice.message).toBeNull();
  });
});
