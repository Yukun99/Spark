import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

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
type RowBox = { top: number; bottom: number };

const SHIFT_TRANSITION = 'transform 150ms ease';

/**
 * Drag a row by its handle: it follows the pointer, rows it passes slide aside, and the list is
 * reordered once on release. Row positions are measured at pointer-down and reused throughout.
 */
export const useRowReorder = ({ rowElement, count, onMove }: UseRowReorderParams): UseRowReorderResult => {
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const boxes = useRef<RowBox[]>([]);
  const startY = useRef(0);
  const setDrag = useCallback((next: Drag | null) => {
    dragRef.current = next;
    setDragState(next);
  }, []);

  const measure = useCallback(() => {
    boxes.current = Array.from({ length: count }, (_, index) => {
      const rect = rowElement(index)?.getBoundingClientRect();
      return { top: rect?.top ?? 0, bottom: rect?.bottom ?? 0 };
    });
  }, [count, rowElement]);

  /** Row whose measured box holds the dragged row's centre, clamped to the list. */
  const indexAt = useCallback((from: number, dy: number) => {
    const box = boxes.current[from];
    const centre = (box.top + box.bottom) / 2 + dy;
    const index = boxes.current.findIndex((row) => centre <= row.bottom);
    return index === -1 ? boxes.current.length - 1 : index;
  }, []);

  const finish = useCallback(() => {
    const current = dragRef.current;
    if (current === null) return;
    setDrag(null);
    if (current.from !== current.to) onMove(current.from, current.to);
  }, [onMove, setDrag]);

  const handleProps = useCallback(
    (index: number): ReorderHandleProps => ({
      onPointerDown: (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        measure();
        startY.current = event.clientY;
        setDrag({ from: index, to: index, dy: 0 });
      },
      onPointerMove: (event) => {
        const current = dragRef.current;
        if (current === null) return;
        const first = boxes.current[0];
        const last = boxes.current[boxes.current.length - 1];
        const box = boxes.current[current.from];
        const dy = Math.min(
          Math.max(event.clientY - startY.current, first.top - box.top),
          last.bottom - box.bottom,
        );
        setDrag({ ...current, dy, to: indexAt(current.from, dy) });
      },
      onPointerUp: (event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        finish();
      },
      onPointerCancel: finish,
    }),
    [finish, indexAt, measure, setDrag],
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
