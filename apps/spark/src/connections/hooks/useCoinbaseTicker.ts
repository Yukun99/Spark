import { coinbaseFeed, type Ticker } from '@/connections/coinbase';
import { useUpdateInterval } from '@/hooks/useUpdateInterval';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

export const useCoinbaseTicker = (productId: string): Ticker | undefined => {
  const { updateIntervalMs } = useUpdateInterval();

  useEffect(() => {
    coinbaseFeed.setUpdateInterval(updateIntervalMs);
  }, [updateIntervalMs]);

  const subscribe = useCallback(
    (listener: () => void) => coinbaseFeed.subscribe(productId, listener),
    [productId],
  );
  const getSnapshot = useCallback(() => coinbaseFeed.getTicker(productId), [productId]);

  return useSyncExternalStore(subscribe, getSnapshot);
};
