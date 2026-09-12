import { coinbaseFeed, type Ticker } from '@/connections/coinbase';
import { useCoinbaseSettingsSync } from '@/connections/hooks/useCoinbaseSettingsSync';
import { useCallback, useSyncExternalStore } from 'react';

export const useCoinbaseTicker = (productId: string): Ticker | undefined => {
  useCoinbaseSettingsSync();

  const subscribe = useCallback(
    (listener: () => void) => coinbaseFeed.subscribe(productId, listener),
    [productId],
  );
  const getSnapshot = useCallback(() => coinbaseFeed.getTicker(productId), [productId]);

  return useSyncExternalStore(subscribe, getSnapshot);
};
