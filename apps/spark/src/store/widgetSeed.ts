// Relative, type-only import: `appShell.ts` pulls this file into the Vite config, which has no
// `@/` alias and must not bundle Redux Toolkit.
import type { Widget } from './widgetsSlice.ts';

export const DEFAULT_PRODUCT_ID = 'BTC-USD';
export const DEFAULT_WATCHLIST_NAME = 'Watchlist';
export const COMMON_WATCHLIST_NAME = 'Common';
export const COMMON_PRODUCT_IDS = [
  'BTC-USD',
  'ETH-USD',
  'SOL-USD',
  'XRP-USD',
  'DOGE-USD',
  'ADA-USD',
  'AVAX-USD',
  'LINK-USD',
  'DOT-USD',
  'LTC-USD',
  'BCH-USD',
  'UNI-USD',
];

/** Widgets on the grid at first load; the static shell draws a skeleton card for each. */
export const SEED_WIDGETS: Widget[] = [
  { id: 'initial', type: 'instrument', layout: { row: 1, col: 5 }, productId: DEFAULT_PRODUCT_ID },
  { id: 'eth', type: 'instrument', layout: { row: 1, col: 6 }, productId: 'ETH-USD' },
  {
    id: 'common',
    type: 'watchlist',
    layout: { row: 2, col: 5, rowSpan: 2, colSpan: 2 },
    name: COMMON_WATCHLIST_NAME,
    productIds: COMMON_PRODUCT_IDS,
  },
  { id: 'orders', type: 'orders', layout: { row: 1, col: 1, rowSpan: 3, colSpan: 4 } },
];
