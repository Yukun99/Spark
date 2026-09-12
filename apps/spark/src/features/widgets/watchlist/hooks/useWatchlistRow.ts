import type { Ticker } from '@/connections/coinbase';
import { useLiveTicker } from '@/connections/hooks/useLiveTicker';
import { restartGlow } from '@/features/widgets/freshnessGlow';
import {
  formatCompactSize,
  formatPrice,
  tickerTime,
} from '@/features/widgets/instrument/tickerFormat';
import { useCallback, useRef, type RefObject } from 'react';

export type UseWatchlistRowResult = {
  bidRef: RefObject<HTMLElement | null>;
  askRef: RefObject<HTMLElement | null>;
  priceRef: RefObject<HTMLElement | null>;
  sizeRef: RefObject<HTMLElement | null>;
  glowRef: RefObject<HTMLDivElement | null>;
};

const setText = (el: HTMLElement | null, text: string) => {
  if (el !== null && el.textContent !== text) el.textContent = text;
};

/**
 * Writes each tick straight into the row's cells through refs, so the row renders once and
 * never re-renders on a tick.
 */
export const useWatchlistRow = (productId: string): UseWatchlistRowResult => {
  const bidRef = useRef<HTMLElement>(null);
  const askRef = useRef<HTMLElement>(null);
  const priceRef = useRef<HTMLElement>(null);
  const sizeRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lastTickAt = useRef<number | undefined>(undefined);

  const apply = useCallback((ticker: Ticker | undefined) => {
    setText(bidRef.current, formatPrice(ticker?.bid));
    setText(askRef.current, formatPrice(ticker?.ask));
    setText(priceRef.current, formatPrice(ticker?.price));
    const size = sizeRef.current;
    if (size !== null) {
      setText(size, formatCompactSize(ticker?.lastSize));
      if (ticker?.side !== undefined) size.dataset.side = ticker.side;
      else delete size.dataset.side;
    }
    const glow = glowRef.current;
    const tickAt = tickerTime(ticker);
    if (glow !== null) {
      glow.hidden = tickAt === undefined;
      if (tickAt !== undefined && tickAt !== lastTickAt.current) restartGlow(glow);
    }
    lastTickAt.current = tickAt;
  }, []);

  useLiveTicker(productId, apply);

  return { bidRef, askRef, priceRef, sizeRef, glowRef };
};
