import { DEFAULT_UPDATE_INTERVAL_MS } from '@/store/settingsSlice';

export const COINBASE_REST_URL = 'https://api.exchange.coinbase.com';
export const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';
export const COINBASE_PROVIDER = 'Coinbase';

const USD_QUOTES = new Set(['USD', 'USDT', 'USDC']);
const RECONNECT_MIN_MS = 1000;
const RECONNECT_MAX_MS = 30000;

export type CoinbaseProduct = {
  id: string;
  base_currency: string;
  quote_currency: string;
  display_name: string;
  status: string;
};

export type TradeSide = 'buy' | 'sell';

export type Ticker = {
  productId: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  price: number;
  lastSize: number;
  side: TradeSide | undefined;
  tradeId: number;
  time: string;
  receivedAt: number;
  open24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  volume30d: number;
};

type TickerMessage = {
  type: 'ticker';
  product_id: string;
  best_bid: string;
  best_ask: string;
  best_bid_size: string;
  best_ask_size: string;
  price: string;
  last_size: string;
  side: string;
  trade_id: number;
  time: string;
  open_24h: string;
  high_24h: string;
  low_24h: string;
  volume_24h: string;
  volume_30d: string;
};

type Listener = () => void;

const subscriptionMessage = (type: 'subscribe' | 'unsubscribe', productIds: string[]) => ({
  type,
  product_ids: productIds,
  channels: ['ticker'],
});

let productsPromise: Promise<CoinbaseProduct[]> | undefined;

/** Online products quoted in USD or a USD stablecoin, fetched once and cached, sorted by id. */
export const getCoinbaseProducts = (): Promise<CoinbaseProduct[]> => {
  productsPromise ??= fetch(`${COINBASE_REST_URL}/products`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Coinbase products request failed: ${response.status}`);
      const products = (await response.json()) as CoinbaseProduct[];
      return products
        .filter((product) => product.status === 'online' && USD_QUOTES.has(product.quote_currency))
        .sort((a, b) => a.id.localeCompare(b.id));
    })
    .catch((error: unknown) => {
      productsPromise = undefined;
      throw error;
    });
  return productsPromise;
};

export const parseTickerMessage = (raw: unknown, receivedAt = Date.now()): Ticker | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const message = raw as Partial<TickerMessage>;
  if (message.type !== 'ticker' || !message.product_id) return undefined;
  const bid = Number(message.best_bid);
  const ask = Number(message.best_ask);
  if (!Number.isFinite(bid) || !Number.isFinite(ask)) return undefined;
  return {
    productId: message.product_id,
    bid,
    ask,
    bidSize: Number(message.best_bid_size),
    askSize: Number(message.best_ask_size),
    price: Number(message.price),
    lastSize: Number(message.last_size),
    side: message.side === 'buy' || message.side === 'sell' ? message.side : undefined,
    tradeId: Number(message.trade_id),
    time: message.time ?? '',
    receivedAt,
    open24h: Number(message.open_24h),
    high24h: Number(message.high_24h),
    low24h: Number(message.low_24h),
    volume24h: Number(message.volume_24h),
    volume30d: Number(message.volume_30d),
  };
};

/**
 * Single shared ticker feed. Ticks land in a map as they stream in; subscribers are notified on
 * a timer (`updateIntervalMs`), so widgets re-render at the chosen cadence regardless of how
 * fast the exchange pushes. The first tick for a product is delivered immediately.
 */
class CoinbaseFeed {
  private socket: WebSocket | null = null;
  private readonly tickers = new Map<string, Ticker>();
  private readonly listeners = new Map<string, Set<Listener>>();
  private readonly dirty = new Set<string>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
  private focusedProductId: string | null = null;
  private streaming = true;
  private reconnectDelay = RECONNECT_MIN_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  getTicker = (productId: string): Ticker | undefined => this.tickers.get(productId);

  setUpdateInterval = (ms: number) => {
    this.updateIntervalMs = Math.max(0, ms);
    if (this.flushTimer === null) return;
    clearTimeout(this.flushTimer);
    this.flushTimer = null;
    this.scheduleFlush();
  };

  /**
   * While a product is focused, only that product stays subscribed on the socket; every other
   * product is paused (listeners kept, last ticker kept) and resumed when focus clears.
   */
  setFocus = (productId: string | null) => {
    if (productId === this.focusedProductId) return;
    this.updateActive(() => {
      this.focusedProductId = productId;
    });
  };

  /** While streaming is off, no product stays subscribed on the socket; all resume when it is on. */
  setStreaming = (streaming: boolean) => {
    if (streaming === this.streaming) return;
    this.updateActive(() => {
      this.streaming = streaming;
    });
  };

  /** Applies a change to what counts as active and sends only the socket subscription diff. */
  private updateActive(change: () => void) {
    const before = this.activeProductIds();
    change();
    const after = new Set(this.activeProductIds());
    const paused = before.filter((id) => !after.has(id));
    const resumed = [...after].filter((id) => !before.includes(id));
    if (paused.length > 0) this.send(subscriptionMessage('unsubscribe', paused));
    if (resumed.length > 0) this.send(subscriptionMessage('subscribe', resumed));
  }

  subscribe = (productId: string, listener: Listener): (() => void) => {
    let listeners = this.listeners.get(productId);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(productId, listeners);
      if (this.isActive(productId)) this.send(subscriptionMessage('subscribe', [productId]));
    }
    listeners.add(listener);
    this.ensureSocket();

    return () => {
      listeners.delete(listener);
      if (listeners.size > 0) return;
      this.listeners.delete(productId);
      this.tickers.delete(productId);
      if (this.isActive(productId)) this.send(subscriptionMessage('unsubscribe', [productId]));
    };
  };

  private isActive(productId: string) {
    if (!this.streaming) return false;
    return this.focusedProductId === null || this.focusedProductId === productId;
  }

  private activeProductIds() {
    return [...this.listeners.keys()].filter((id) => this.isActive(id));
  }

  private ensureSocket() {
    if (this.socket) return;
    const socket = new WebSocket(COINBASE_WS_URL);
    this.socket = socket;
    socket.onopen = () => {
      this.reconnectDelay = RECONNECT_MIN_MS;
      const productIds = this.activeProductIds();
      if (productIds.length > 0) {
        socket.send(JSON.stringify(subscriptionMessage('subscribe', productIds)));
      }
    };
    socket.onmessage = (event: MessageEvent<string>) => this.onMessage(event.data);
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      if (this.listeners.size > 0) this.scheduleReconnect();
    };
  }

  private send(message: object) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message));
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureSocket();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, RECONNECT_MAX_MS);
  }

  private onMessage(data: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    const ticker = parseTickerMessage(parsed);
    if (!ticker || !this.listeners.has(ticker.productId)) return;
    const isFirst = !this.tickers.has(ticker.productId);
    this.tickers.set(ticker.productId, ticker);
    this.dirty.add(ticker.productId);
    if (isFirst) this.flush();
    else this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, this.updateIntervalMs);
  }

  private flush() {
    const productIds = [...this.dirty];
    this.dirty.clear();
    for (const productId of productIds) {
      this.listeners.get(productId)?.forEach((listener) => listener());
    }
  }
}

export const coinbaseFeed = new CoinbaseFeed();
