import { useCallback, useRef, useState, type PointerEvent } from 'react';

export type UseRowReorderParams = {
  /** Element of the row at `index`, for hit-testing the pointer against the list. */
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
};

/**
 * Drag a row by its handle: the list reorders live as the pointer crosses other rows, so the
 * dragged row (same key) follows the pointer without any transforms.
 */
export const useRowReorder = ({ rowElement, count, onMove }: UseRowReorderParams): UseRowReorderResult => {
  const [dragging, setDragging] = useState<number | null>(null);
  const current = useRef<number | null>(null);

  const indexAt = useCallback(
    (clientY: number) => {
      for (let index = 0; index < count; index++) {
        const rect = rowElement(index)?.getBoundingClientRect();
        if (rect === undefined) continue;
        if (clientY < rect.top) return index === 0 ? 0 : index - 1;
        if (clientY <= rect.bottom) return index;
      }
      return count - 1;
    },
    [count, rowElement],
  );

  const finish = useCallback(() => {
    current.current = null;
    setDragging(null);
  }, []);

  const handleProps = useCallback(
    (index: number): ReorderHandleProps => ({
      onPointerDown: (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        current.current = index;
        setDragging(index);
      },
      onPointerMove: (event) => {
        const from = current.current;
        if (from === null) return;
        const to = indexAt(event.clientY);
        if (to === from) return;
        current.current = to;
        setDragging(to);
        onMove(from, to);
      },
      onPointerUp: (event) => {
        if (current.current === null) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        finish();
      },
      onPointerCancel: finish,
    }),
    [finish, indexAt, onMove],
  );

  return { dragging, handleProps };
};
