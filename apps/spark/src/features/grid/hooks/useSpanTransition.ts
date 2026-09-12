import type { WidgetLayout } from '@/features/grid/gridTypes';
import { useLayoutEffect, useRef, type RefObject } from 'react';

export const SPAN_TRANSITION_MS = 200;

type Snapshot = { rect: DOMRect; rowSpan: number; colSpan: number };

/**
 * Animates a grid item between its old and new box when its span changes (FLIP): the element is
 * first transformed back onto its previous box, then eased to its natural place. Position-only
 * changes (drag moves) are left alone.
 */
export const useSpanTransition = (ref: RefObject<HTMLElement | null>, layout: WidgetLayout) => {
  const { rowSpan = 1, colSpan = 1 } = layout;
  const previous = useRef<Snapshot | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const last = previous.current;
    previous.current = { rect, rowSpan, colSpan };
    if (!last || (last.rowSpan === rowSpan && last.colSpan === colSpan)) return;
    if (rect.width === 0 || rect.height === 0) return;

    const dx = last.rect.left - rect.left;
    const dy = last.rect.top - rect.top;
    const sx = last.rect.width / rect.width;
    const sy = last.rect.height / rect.height;
    element.style.transition = 'none';
    element.style.transformOrigin = 'top left';
    element.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    void element.offsetWidth;
    element.style.transition = `transform ${SPAN_TRANSITION_MS}ms ease-out`;
    element.style.transform = '';
  }, [ref, layout.row, layout.col, rowSpan, colSpan]);
};
