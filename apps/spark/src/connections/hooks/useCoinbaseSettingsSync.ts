import { coinbaseFeed } from '@/connections/coinbase';
import { useStreaming } from '@/common/hooks/useStreaming';
import { useUpdateInterval } from '@/common/hooks/useUpdateInterval';
import { useEffect } from 'react';

/** Pushes the store's feed settings (update interval, streaming on/off) into the shared feed. */
export const useCoinbaseSettingsSync = () => {
  const { updateIntervalMs } = useUpdateInterval();
  const { streaming } = useStreaming();

  useEffect(() => {
    coinbaseFeed.setUpdateInterval(updateIntervalMs);
  }, [updateIntervalMs]);

  useEffect(() => {
    coinbaseFeed.setStreaming(streaming);
  }, [streaming]);
};
