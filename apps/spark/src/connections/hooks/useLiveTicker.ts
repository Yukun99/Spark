import { coinbaseFeed, type Ticker } from '@/connections/coinbase';
import { useEffect } from 'react';

export type TickHandler = (ticker: Ticker | undefined) => void;

/**
 * Calls `onTick` with the current snapshot on mount and again on every feed notification,
 * without any React state, so a tick never re-renders the caller. Pass a memoised `onTick`.
 */
export const useLiveTicker = (productId: string, onTick: TickHandler) => {
  useEffect(() => {
    const apply = () => onTick(coinbaseFeed.getTicker(productId));
    apply();
    return coinbaseFeed.subscribe(productId, apply);
  }, [productId, onTick]);
};
