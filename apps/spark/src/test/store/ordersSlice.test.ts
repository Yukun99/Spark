import { addOrder, ordersReducer, type OrderDraft } from '@/store/ordersSlice';

const draft: OrderDraft = {
  productId: 'BTC-USD',
  side: 'buy',
  type: 'limit',
  timeInForce: 'GTC',
  price: 100,
  size: 0.5,
  provider: 'Coinbase',
  priceAt: 1000,
};

describe('ordersSlice', () => {
  it('starts empty and appends placed orders with an id and timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-12T10:00:00Z'));
    const initial = ordersReducer(undefined, { type: 'init' });
    expect(initial.items).toEqual([]);

    const one = ordersReducer(initial, addOrder(draft));
    const two = ordersReducer(one, addOrder({ ...draft, side: 'sell' }));
    expect(two.items).toHaveLength(2);
    expect(two.items[0]).toMatchObject({ ...draft, placedAt: Date.parse('2026-09-12T10:00:00Z') });
    expect(two.items[1].side).toBe('sell');
    expect(two.items[0].id).not.toBe(two.items[1].id);
    vi.useRealTimers();
  });
});
