import type { Ticker, TradeSide } from '@/connections/coinbase';
import {
  formatInteger,
  formatPercent,
  formatPrice,
  formatSize,
  formatTime,
  tickerTime,
} from '@/features/widgets/instrument/tickerFormat';

export type DetailField =
  { label: string; value: string } | { label: string; side: TradeSide | undefined };

export type DetailSection = { id: string; fields: DetailField[] };

/** Book, last-trade and 24h stat groups shown in the instrument and order dialogs. */
export const buildSections = (ticker: Ticker | undefined): DetailSection[] => {
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
        { label: 'Last Trade Size', value: formatSize(ticker?.lastSize) },
        { label: 'Transaction Type', side: ticker?.side },
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
