import { parseTickerMessage } from '@/connections/coinbase';

describe('parseTickerMessage', () => {
  it('parses a ticker message into numbers', () => {
    expect(
      parseTickerMessage({
        type: 'ticker',
        product_id: 'BTC-USD',
        best_bid: '100.5',
        best_ask: '100.7',
        price: '100.6',
        time: '2026-09-12T00:00:00Z',
      }),
    ).toEqual({ productId: 'BTC-USD', bid: 100.5, ask: 100.7, price: 100.6, time: '2026-09-12T00:00:00Z' });
  });

  it('ignores other message types and malformed prices', () => {
    expect(parseTickerMessage({ type: 'subscriptions' })).toBeUndefined();
    expect(parseTickerMessage({ type: 'ticker', product_id: 'BTC-USD', best_bid: 'x', best_ask: '1' })).toBeUndefined();
    expect(parseTickerMessage(null)).toBeUndefined();
  });
});
