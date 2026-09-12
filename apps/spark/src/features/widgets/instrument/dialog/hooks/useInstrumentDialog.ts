import { coinbaseFeed, type Ticker } from '@/connections/coinbase';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import {
  formatInteger,
  formatPercent,
  formatPrice,
  formatSide,
  formatSize,
  formatTime,
  formatUpdatedAt,
  tickerTime,
} from '@/features/widgets/instrument/tickerFormat';
import { useEffect, useMemo } from 'react';

export type DetailField = { label: string; value: string };

export type DetailSection = { id: string; fields: DetailField[] };

export type UseInstrumentDialogResult = {
  updatedAt: string;
  sections: DetailSection[];
};

const buildSections = (ticker: Ticker | undefined): DetailSection[] => {
  const spread = ticker && ticker.ask - ticker.bid;
  const mid = ticker && (ticker.ask + ticker.bid) / 2;
  const change = ticker && ticker.price - ticker.open24h;
  const changePct = ticker && change !== undefined ? change / ticker.open24h : undefined;

  return [
    {
      id: 'book',
      fields: [
        { label: 'Bid', value: formatPrice(ticker?.bid) },
        { label: 'Bid Size', value: formatSize(ticker?.bidSize) },
        { label: 'Ask', value: formatPrice(ticker?.ask) },
        { label: 'Ask Size', value: formatSize(ticker?.askSize) },
        { label: 'Spread', value: formatPrice(spread) },
        { label: 'Mid', value: formatPrice(mid) },
      ],
    },
    {
      id: 'trade',
      fields: [
        { label: 'Last Trade Price', value: formatPrice(ticker?.price) },
        { label: 'Last Trade Amount', value: formatSize(ticker?.lastSize) },
        { label: 'Transaction Type', value: formatSide(ticker?.side) },
        { label: 'Last Trade ID', value: formatInteger(ticker?.tradeId) },
        { label: 'Last Trade Time', value: formatTime(tickerTime(ticker)) },
      ],
    },
    {
      id: 'stats',
      fields: [
        { label: '24H Open', value: formatPrice(ticker?.open24h) },
        { label: '24H High', value: formatPrice(ticker?.high24h) },
        { label: '24H Low', value: formatPrice(ticker?.low24h) },
        { label: '24H Change', value: formatPrice(change) },
        { label: '24H Change %', value: formatPercent(changePct) },
        { label: '24H Volume', value: formatSize(ticker?.volume24h) },
        { label: '30D Volume', value: formatSize(ticker?.volume30d) },
      ],
    },
  ];
};

/** Live details for one product; while mounted, the feed only streams that product. */
export const useInstrumentDialog = (productId: string): UseInstrumentDialogResult => {
  const ticker = useCoinbaseTicker(productId);

  useEffect(() => {
    coinbaseFeed.setFocus(productId);
    return () => coinbaseFeed.setFocus(null);
  }, [productId]);

  const sections = useMemo(() => buildSections(ticker), [ticker]);

  return { updatedAt: formatUpdatedAt(ticker), sections };
};