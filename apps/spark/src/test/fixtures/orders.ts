import { fetchOrders, setOrdersPageSize, type Order, type OrdersPage } from '@/store/ordersSlice';
import type { AppStore } from '@/store/store';

const PLACED_AT = Date.UTC(2026, 8, 12, 9, 0, 0);
const MINUTE_MS = 60_000;

type SampleOrder = Omit<Order, 'id' | 'provider' | 'placedAt'>;

const SAMPLES: SampleOrder[] = [
  { productId: 'BTC-USD', side: 'buy', type: 'market', timeInForce: 'GTC', price: 77450.12, size: 0.5, filledSize: 0.5, status: 'fulfilled' },
  { productId: 'ETH-USD', side: 'sell', type: 'limit', timeInForce: 'GTC', price: 2540, size: 2, filledSize: 0.75, status: 'fulfilling' },
  { productId: 'SOL-USD', side: 'buy', type: 'limit', timeInForce: 'IOC', price: 102.5, size: 25, filledSize: 0, status: 'pending' },
  { productId: 'XRP-USD', side: 'sell', type: 'market', timeInForce: 'FOK', price: 1.37, size: 1000, filledSize: 1000, status: 'fulfilled' },
  { productId: 'DOGE-USD', side: 'buy', type: 'limit', timeInForce: 'GTC', price: 0.085, size: 5000, filledSize: 1234.5678, status: 'fulfilling' },
  { productId: 'ADA-USD', side: 'sell', type: 'limit', timeInForce: 'GTC', price: 0.21, size: 800, filledSize: 0, status: 'pending' },
  { productId: 'DOT-USD', side: 'buy', type: 'limit', timeInForce: 'GTC', price: 4.2, size: 300, filledSize: 0, status: 'fulfilling' },
  { productId: 'AVAX-USD', side: 'buy', type: 'market', timeInForce: 'IOC', price: 7.43, size: 120, filledSize: 119.99, status: 'fulfilling' },
  { productId: 'LINK-USD', side: 'sell', type: 'limit', timeInForce: 'FOK', price: 11.58, size: 40, filledSize: 40, status: 'fulfilled' },
  { productId: 'LTC-USD', side: 'buy', type: 'limit', timeInForce: 'GTC', price: 68.2, size: 10, filledSize: 3, status: 'cancelled' },
];

/** Orders across instruments and fill states, one minute apart, oldest first. */
export const sampleOrders = (): Order[] =>
  SAMPLES.map((order, index) => ({
    ...order,
    id: `sample-${index}`,
    provider: 'Coinbase',
    placedAt: PLACED_AT + index * MINUTE_MS,
  }));

/** `count` orders cycling through the samples, one minute apart, oldest first. */
export const manyOrders = (count: number): Order[] =>
  Array.from({ length: count }, (_, index) => ({
    ...SAMPLES[index % SAMPLES.length],
    id: `many-${index}`,
    provider: 'Coinbase',
    placedAt: PLACED_AT + index * MINUTE_MS,
  }));

export const SEED_PAGE_SIZE = 10;

/** The single page the server would return for `sampleOrders`, newest first. */
export const sampleOrdersPage = (): OrdersPage => ({
  items: sampleOrders().reverse(),
  page: 1,
  pageCount: 1,
  total: SAMPLES.length,
});

/** Loads `sampleOrdersPage` into the store at once, as if the widget had already fetched it. */
export const seedOrders = (store: AppStore) => {
  store.dispatch(setOrdersPageSize(SEED_PAGE_SIZE));
  store.dispatch(fetchOrders.fulfilled(sampleOrdersPage(), 'seed'));
};
