import { coinbaseFeed } from '@/connections/coinbase';
import { tickerTime } from '@/features/widgets/instrument/tickerFormat';
import { useCallback, useSyncExternalStore } from 'react';

/** Time of the newest tick across `productIds`, or undefined while none has arrived. */
export const useCoinbaseLatestTick = (productIds: string[]): number | undefined => {
  const key = productIds.join(',');

  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribes = key
        .split(',')
        .filter(Boolean)
        .map((productId) => coinbaseFeed.subscribe(productId, listener));
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    },
    [key],
  );
  const getSnapshot = useCallback(
    () =>
      key
        .split(',')
        .filter(Boolean)
        .reduce<number | undefined>((latest, productId) => {
          const time = tickerTime(coinbaseFeed.getTicker(productId));
          return time !== undefined && (latest === undefined || time > latest) ? time : latest;
        }, undefined),
    [key],
  );

  return useSyncExternalStore(subscribe, getSnapshot);
};
