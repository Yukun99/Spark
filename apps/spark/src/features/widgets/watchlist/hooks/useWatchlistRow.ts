import type { TradeSide } from '@/connections/coinbase';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import { formatPrice, tickerTime } from '@/features/widgets/instrument/tickerFormat';
import { useEditMode } from '@/hooks/useEditMode';

export type UseWatchlistRowResult = {
  bid: string;
  ask: string;
  price: string;
  side: TradeSide | undefined;
  tickAt: number | undefined;
};

export const useWatchlistRow = (productId: string): UseWatchlistRowResult => {
  const ticker = useCoinbaseTicker(productId);
  const { editMode } = useEditMode();

  return {
    bid: formatPrice(ticker?.bid),
    ask: formatPrice(ticker?.ask),
    price: formatPrice(ticker?.price),
    side: ticker?.side,
    tickAt: editMode ? undefined : tickerTime(ticker),
  };
};
