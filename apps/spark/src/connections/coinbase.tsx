import { DEFAULT_UPDATE_INTERVAL_MS } from '@/store/settingsSlice';

export const COINBASE_REST_URL = 'https://api.exchange.coinbase.com';
export const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';

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

export type Ticker = {
  productId: string;
  bid: number;
  ask: number;
  price: number;
  time: string;
  receivedAt: number;
};

type TickerMessage = {
  type: 'ticker';
  product_id: string;
  best_bid: string;
  best_ask: string;
  price: string;
  time: string;
};

type Listener = () => void;

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
    price: Number(message.price),
    time: message.time ?? '',
    receivedAt,
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

  subscribe = (productId: string, listener: Listener): (() => void) => {
    let listeners = this.listeners.get(productId);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(productId, listeners);
      this.send({ type: 'subscribe', product_ids: [productId], channels: ['ticker'] });
    }
    listeners.add(listener);
    this.ensureSocket();

    return () => {
      listeners.delete(listener);
      if (listeners.size > 0) return;
      this.listeners.delete(productId);
      this.tickers.delete(productId);
      this.send({ type: 'unsubscribe', product_ids: [productId], channels: ['ticker'] });
    };
  };

  private ensureSocket() {
    if (this.socket) return;
    const socket = new WebSocket(COINBASE_WS_URL);
    this.socket = socket;
    socket.onopen = () => {
      this.reconnectDelay = RECONNECT_MIN_MS;
      const productIds = [...this.listeners.keys()];
      if (productIds.length > 0) {
        socket.send(
          JSON.stringify({ type: 'subscribe', product_ids: productIds, channels: ['ticker'] }),
        );
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
