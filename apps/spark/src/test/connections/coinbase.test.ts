import { coinbaseFeed, parseTickerMessage } from '@/connections/coinbase';

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
    ).toEqual({
      productId: 'BTC-USD',
      bid: 100.5,
      ask: 100.7,
      price: 100.6,
      time: '2026-09-12T00:00:00Z',
      receivedAt: 42,
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
});
