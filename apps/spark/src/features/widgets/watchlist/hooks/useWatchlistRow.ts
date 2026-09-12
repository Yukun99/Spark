import type { TradeSide } from '@/connections/coinbase';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import {
  formatPrice,
  formatCompactSize,
  tickerTime,
} from '@/features/widgets/instrument/tickerFormat';

export type UseWatchlistRowResult = {
  bid: string;
  ask: string;
  price: string;
  size: string;
  side: TradeSide | undefined;
  tickAt: number | undefined;
};

export const useWatchlistRow = (productId: string): UseWatchlistRowResult => {
  const ticker = useCoinbaseTicker(productId);

  return {
    bid: formatPrice(ticker?.bid),
    ask: formatPrice(ticker?.ask),
    price: formatPrice(ticker?.price),
    size: formatCompactSize(ticker?.lastSize),
    side: ticker?.side,
    tickAt: tickerTime(ticker),
  };
};
