import { coinbaseFeed } from '@/connections/coinbase';
import { useEffect } from 'react';

/** While mounted, the feed streams only this product; every other subscription pauses. */
export const useCoinbaseFocus = (productId: string) => {
  useEffect(() => {
    coinbaseFeed.setFocus(productId);
    return () => coinbaseFeed.setFocus(null);
  }, [productId]);
};
