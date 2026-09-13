import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** Vertical gap between a widget's header and rows, in px; the page-size maths counts it. */
export const LIST_ROW_GAP_PX = 8;

/** Page size where layout can't be measured (jsdom has no `ResizeObserver`). */
export const FALLBACK_PAGE_SIZE = 10;

export type UsePageSizeParams = {
  /** Row and header heights in px assumed until real ones have been rendered and measured. */
  estimate: { header: number; row: number };
};

export type UsePageSizeResult = {
  /** Put on the box whose free height the rows share. */
  containerRef: (node: HTMLDivElement | null) => void;
  headerRef: RefObject<HTMLDivElement | null>;
  /** Put on the first rendered row. */
  rowRef: RefObject<HTMLDivElement | null>;
  /** Rows that fit the container; null until it has been measured. */
  pageSize: number | null;
};

const rowsThatFit = (available: number, rowPx: number) =>
  Math.max(1, Math.floor((available + LIST_ROW_GAP_PX) / (rowPx + LIST_ROW_GAP_PX)));

/**
 * How many rows fit the container: remeasured whenever it resizes and after every render, so a
 * first real row replaces the estimate as soon as it appears.
 */
export const usePageSize = ({ estimate }: UsePageSizeParams): UsePageSizeResult => {
  const supported = typeof ResizeObserver !== 'undefined';
  const [pageSize, setPageSize] = useState<number | null>(supported ? null : FALLBACK_PAGE_SIZE);
  const container = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    const height = container.current?.clientHeight ?? 0;
    if (height === 0) return;
    const headerPx = headerRef.current?.offsetHeight || estimate.header;
    const rowPx = rowRef.current?.offsetHeight || estimate.row;
    setPageSize(rowsThatFit(height - headerPx, rowPx));
  }, [estimate.header, estimate.row]);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!supported) return;
      observer.current ??= new ResizeObserver(measure);
      observer.current.disconnect();
      container.current = node;
      if (node !== null) observer.current.observe(node);
    },
    [measure, supported],
  );

  useLayoutEffect(() => {
    if (supported) measure();
  });

  return { containerRef, headerRef, rowRef, pageSize };
};
