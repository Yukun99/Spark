import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

export type UseRowReorderParams = {
  /** Element of the row at `index`, measured when a drag starts. */
  rowElement: (index: number) => HTMLElement | null | undefined;
  /** Rows at index `count` and beyond cannot be dragged or dropped onto. */
  count: number;
  onMove: (from: number, to: number) => void;
};

export type ReorderHandleProps = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
};

export type UseRowReorderResult = {
  /** Index of the row being dragged, or null. */
  dragging: number | null;
  handleProps: (index: number) => ReorderHandleProps;
  /** Transform for the row at `index` while a drag is in progress. */
  rowStyle: (index: number) => CSSProperties | undefined;
};

type Drag = { from: number; to: number; dy: number };
/** Row bounds in the scroll container's content coordinates, so scrolling doesn't move them. */
type RowBox = { top: number; bottom: number };

const SHIFT_TRANSITION = 'transform 150ms ease';
/** Band inside the scroll container's edges where dragging scrolls it. */
const SCROLL_EDGE_PX = 32;
const SCROLL_MAX_PX_PER_FRAME = 12;

/** Nearest ancestor that scrolls vertically, if any. */
const scrollParent = (element: HTMLElement | null | undefined): HTMLElement | null => {
  for (let node = element?.parentElement ?? null; node !== null; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  return null;
};

/** Scroll speed for a pointer at `clientY`: negative near the top edge, positive near the bottom. */
const scrollSpeed = (scroller: HTMLElement, clientY: number) => {
  const { top, bottom } = scroller.getBoundingClientRect();
  const past = Math.max(top + SCROLL_EDGE_PX - clientY, clientY - (bottom - SCROLL_EDGE_PX), 0);
  if (past === 0) return 0;
  const speed = Math.min(1, past / SCROLL_EDGE_PX) * SCROLL_MAX_PX_PER_FRAME;
  return clientY < top + SCROLL_EDGE_PX ? -speed : speed;
};

/**
 * Drag a row by its handle: it follows the pointer, rows it passes slide aside, and the list is
 * reordered once on release. Near the scroll container's edges the drag scrolls it as well.
 */
export const useRowReorder = ({ rowElement, count, onMove }: UseRowReorderParams): UseRowReorderResult => {
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const boxes = useRef<RowBox[]>([]);
  const scroller = useRef<HTMLElement | null>(null);
  const startY = useRef(0);
  const lastClientY = useRef(0);
  const frame = useRef<number | null>(null);
  const setDrag = useCallback((next: Drag | null) => {
    dragRef.current = next;
    setDragState(next);
  }, []);

  const scrollTop = () => scroller.current?.scrollTop ?? 0;

  const measure = useCallback(
    (from: number) => {
      scroller.current = scrollParent(rowElement(from));
      const offset = scrollTop();
      boxes.current = Array.from({ length: count }, (_, index) => {
        const rect = rowElement(index)?.getBoundingClientRect();
        return { top: (rect?.top ?? 0) + offset, bottom: (rect?.bottom ?? 0) + offset };
      });
    },
    [count, rowElement],
  );

  /** Row whose box holds the dragged row's centre, clamped to the list. */
  const indexAt = useCallback((from: number, dy: number) => {
    const box = boxes.current[from];
    const centre = (box.top + box.bottom) / 2 + dy;
    const index = boxes.current.findIndex((row) => centre <= row.bottom);
    return index === -1 ? boxes.current.length - 1 : index;
  }, []);

  /** Repositions the dragged row for the pointer's current place in the content. */
  const track = useCallback(
    (clientY: number) => {
      const current = dragRef.current;
      if (current === null) return;
      lastClientY.current = clientY;
      const first = boxes.current[0];
      const last = boxes.current[boxes.current.length - 1];
      const box = boxes.current[current.from];
      const dy = Math.min(
        Math.max(clientY + scrollTop() - startY.current, first.top - box.top),
        last.bottom - box.bottom,
      );
      setDrag({ ...current, dy, to: indexAt(current.from, dy) });
    },
    [indexAt, setDrag],
  );

  const stopScrolling = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  /** Scrolls the container each frame while the pointer sits in an edge band. */
  const autoScroll = useCallback(
    (clientY: number) => {
      const element = scroller.current;
      const speed = element === null ? 0 : scrollSpeed(element, clientY);
      if (speed === 0 || element === null) {
        stopScrolling();
        return;
      }
      if (frame.current !== null) return;
      const step = () => {
        if (dragRef.current === null || scroller.current === null) return;
        const before = scroller.current.scrollTop;
        scroller.current.scrollTop = before + scrollSpeed(scroller.current, lastClientY.current);
        track(lastClientY.current);
        frame.current = scroller.current.scrollTop === before ? null : requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    },
    [stopScrolling, track],
  );

  const finish = useCallback(() => {
    stopScrolling();
    const current = dragRef.current;
    if (current === null) return;
    setDrag(null);
    if (current.from !== current.to) onMove(current.from, current.to);
  }, [onMove, setDrag, stopScrolling]);

  useEffect(() => stopScrolling, [stopScrolling]);

  const handleProps = useCallback(
    (index: number): ReorderHandleProps => ({
      onPointerDown: (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        measure(index);
        startY.current = event.clientY + scrollTop();
        lastClientY.current = event.clientY;
        setDrag({ from: index, to: index, dy: 0 });
      },
      onPointerMove: (event) => {
        if (dragRef.current === null) return;
        track(event.clientY);
        autoScroll(event.clientY);
      },
      onPointerUp: (event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        finish();
      },
      onPointerCancel: finish,
    }),
    [autoScroll, finish, measure, setDrag, track],
  );

  const rowStyle = useCallback(
    (index: number): CSSProperties | undefined => {
      if (drag === null) return undefined;
      const { from, to, dy } = drag;
      if (index === from) return { transform: `translateY(${dy}px)`, position: 'relative', zIndex: 1 };
      const box = boxes.current[from];
      const next = boxes.current[from + 1] ?? boxes.current[from - 1];
      const shift = next === undefined ? 0 : Math.abs(next.top - box.top);
      const passed = from < to ? index > from && index <= to : index >= to && index < from;
      return {
        transform: passed ? `translateY(${from < to ? -shift : shift}px)` : undefined,
        transition: SHIFT_TRANSITION,
      };
    },
    [drag],
  );

  return { dragging: drag?.from ?? null, handleProps, rowStyle };
};
