import { addOrder, ordersReducer, type OrderDraft } from '@/store/ordersSlice';

const draft: OrderDraft = {
  productId: 'BTC-USD',
  side: 'buy',
  type: 'limit',
  timeInForce: 'GTC',
  price: 100,
  size: 0.5,
  provider: 'Coinbase',
};

describe('ordersSlice', () => {
  it('seeds orders whose fill matches their status', () => {
    const { items } = ordersReducer(undefined, { type: 'init' });
    expect(items.length).toBeGreaterThan(0);
    for (const order of items) {
      if (order.status === 'pending') expect(order.filledSize).toBe(0);
      if (order.status === 'fulfilling') {
        expect(order.filledSize).toBeGreaterThanOrEqual(0);
        expect(order.filledSize).toBeLessThan(order.size);
      }
      if (order.status === 'fulfilled') expect(order.filledSize).toBe(order.size);
    }
    expect(new Set(items.map((order) => order.status)).size).toBe(3);
    expect(items.some((order) => order.status === 'fulfilling' && order.filledSize === 0)).toBe(true);
  });

  it('appends placed orders as pending with nothing filled and a timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-12T10:00:00Z'));
    const initial = ordersReducer(undefined, { type: 'init' });
    const seeded = initial.items.length;

    const one = ordersReducer(initial, addOrder(draft));
    const two = ordersReducer(one, addOrder({ ...draft, side: 'sell' }));
    expect(two.items).toHaveLength(seeded + 2);
    expect(two.items[seeded]).toEqual({
      ...draft,
      filledSize: 0,
      status: 'pending',
      placedAt: Date.parse('2026-09-12T10:00:00Z'),
    });
    expect(two.items[seeded + 1].side).toBe('sell');
    vi.useRealTimers();
  });
});
