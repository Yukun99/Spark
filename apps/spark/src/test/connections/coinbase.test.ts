import { coinbaseFeed, getCoinbaseProducts, parseTickerMessage } from '@/connections/coinbase';

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
      }, 42),
    ).toMatchObject({
      productId: 'BTC-USD',
      bid: 100.5,
      ask: 100.7,
      price: 100.6,
      time: '2026-09-12T00:00:00Z',
      receivedAt: 42,
      side: undefined,
    });
  });

  it('ignores other message types and malformed prices', () => {
    expect(parseTickerMessage({ type: 'subscriptions' })).toBeUndefined();
    expect(parseTickerMessage({ type: 'ticker', product_id: 'BTC-USD', best_bid: 'x', best_ask: '1' })).toBeUndefined();
    expect(parseTickerMessage(null)).toBeUndefined();
  });
});

class FakeSocket {
  static instance: FakeSocket | null = null;
  static OPEN = 1;
  readyState = FakeSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();
  constructor() {
    FakeSocket.instance = this;
  }
}

const tick = (bid: number) =>
  FakeSocket.instance?.onmessage?.({
    data: JSON.stringify({ type: 'ticker', product_id: 'BTC-USD', best_bid: bid, best_ask: bid + 1 }),
  });

describe('coinbaseFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', FakeSocket);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('notifies at the update interval and reschedules when it changes', () => {
    coinbaseFeed.setUpdateInterval(1000);
    const listener = vi.fn();
    const unsubscribe = coinbaseFeed.subscribe('BTC-USD', listener);

    tick(1);
    expect(listener).toHaveBeenCalledTimes(1);

    tick(2);
    tick(3);
    vi.advanceTimersByTime(999);
    expect(listener).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(coinbaseFeed.getTicker('BTC-USD')?.bid).toBe(3);

    tick(4);
    coinbaseFeed.setUpdateInterval(250);
    vi.advanceTimersByTime(250);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
  });

  it('shares one socket subscription between listeners of the same product', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = coinbaseFeed.subscribe('BTC-USD', first);
    const send = FakeSocket.instance?.send;
    send?.mockClear();
    const unsubscribeSecond = coinbaseFeed.subscribe('BTC-USD', second);
    expect(send).not.toHaveBeenCalled();

    tick(1);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    expect(send).not.toHaveBeenCalled();
    unsubscribeSecond();
    expect(JSON.parse(send?.mock.calls[0][0])).toMatchObject({
      type: 'unsubscribe',
      product_ids: ['BTC-USD'],
    });
  });

  it('pauses every other product while one is focused and resumes them after', () => {
    const unsubscribeBtc = coinbaseFeed.subscribe('BTC-USD', vi.fn());
    const unsubscribeEth = coinbaseFeed.subscribe('ETH-USD', vi.fn());
    const send = FakeSocket.instance?.send;
    send?.mockClear();

    coinbaseFeed.setFocus('BTC-USD');
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(send?.mock.calls[0][0])).toMatchObject({
      type: 'unsubscribe',
      product_ids: ['ETH-USD'],
    });

    coinbaseFeed.setFocus(null);
    expect(JSON.parse(send?.mock.calls[1][0])).toMatchObject({
      type: 'subscribe',
      product_ids: ['ETH-USD'],
    });

    unsubscribeBtc();
    unsubscribeEth();
  });
});

describe('getCoinbaseProducts', () => {
  const product = (id: string, status = 'online') => ({
    id,
    base_currency: id.split('-')[0],
    quote_currency: id.split('-')[1],
    display_name: id.replace('-', '/'),
    status,
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retries after a failed request, then filters, sorts and caches the result', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            product('ETH-USD'),
            product('BTC-EUR'),
            product('BTC-USDT'),
            product('SOL-USD', 'delisted'),
            product('ADA-USDC'),
          ]),
      });
    vi.stubGlobal('fetch', fetch);

    await expect(getCoinbaseProducts()).rejects.toThrow('Coinbase products request failed: 500');

    const products = await getCoinbaseProducts();
    expect(products.map((item) => item.id)).toEqual(['ADA-USDC', 'BTC-USDT', 'ETH-USD']);

    await getCoinbaseProducts();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
