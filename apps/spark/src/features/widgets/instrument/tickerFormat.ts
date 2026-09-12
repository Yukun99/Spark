import type { Ticker } from '@/connections/coinbase';

const EMPTY = '--';

const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

const sizeFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 });

const percentFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hour12: false,
});

const isValue = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value);

export const formatPrice = (value: number | undefined) =>
  isValue(value) ? priceFormat.format(value) : EMPTY;

export const formatSize = (value: number | undefined) =>
  isValue(value) ? sizeFormat.format(value) : EMPTY;

export const formatPercent = (value: number | undefined) =>
  isValue(value) ? percentFormat.format(value) : EMPTY;

const MAX_COMPACT_DIGITS = 11;
const MAX_SIZE_FRACTION = 8;

/** One truncating formatter per fraction length, reused across ticks. */
const compactFormats = Array.from(
  { length: MAX_SIZE_FRACTION + 1 },
  (_, fraction) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: fraction, roundingMode: 'trunc' }),
);

/**
 * Size for tight cells: up to 8 decimals while the integer part has at most 3 digits, after
 * which decimals are truncated so the total stays at 11 digits (999.00000001, 9999.0000000).
 */
export const formatCompactSize = (value: number | undefined) => {
  if (!isValue(value)) return EMPTY;
  const integerDigits = Math.max(1, Math.floor(Math.log10(Math.abs(value))) + 1);
  const fraction = Math.max(0, Math.min(MAX_SIZE_FRACTION, MAX_COMPACT_DIGITS - integerDigits));
  return compactFormats[fraction].format(value);
};

export const formatInteger = (value: number | undefined) => (isValue(value) ? String(value) : EMPTY);

export const formatTime = (value: number | undefined) =>
  isValue(value) ? timeFormat.format(value) : EMPTY;

/** Exchange timestamp of the tick when present, otherwise the time it arrived. */
export const tickerTime = (ticker: Ticker | undefined): number | undefined => {
  if (!ticker) return undefined;
  const exchangeTime = Date.parse(ticker.time);
  return Number.isNaN(exchangeTime) ? ticker.receivedAt : exchangeTime;
};

export const formatUpdatedAt = (ticker: Ticker | undefined) => formatTime(tickerTime(ticker));
