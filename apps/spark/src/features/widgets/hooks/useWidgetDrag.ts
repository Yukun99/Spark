import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';
import { useCallback, useRef, useState, type MouseEvent, type PointerEvent } from 'react';

type Offset = { dx: number; dy: number };
type DragOrigin = Offset & { pointerX: number; pointerY: number; cellWidth: number; cellHeight: number };

const NO_OFFSET: Offset = { dx: 0, dy: 0 };
const DRAG_THRESHOLD_PX = 4;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type UseWidgetDragParams = {
  layout: WidgetLayout;
  enabled: boolean;
  onStart: () => void;
  onHover: (target: WidgetLayout | null) => void;
  onDrop: (cell: GridCell) => void;
  onEnd: () => void;
};

export type UseWidgetDragResult = {
  dragging: boolean;
  offset: Offset;
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: () => void;
    onClickCapture: (event: MouseEvent<HTMLElement>) => void;
  };
};

/**
 * Pointer-drag a widget, report the grid area under it, and snap to the nearest valid cell on
 * release. The card may leave the grid; the hovered area then follows it out so placeholders
 * reappear under cells it no longer covers.
 */
export const useWidgetDrag = ({
  layout,
  enabled,
  onStart,
  onHover,
  onDrop,
  onEnd,
}: UseWidgetDragParams): UseWidgetDragResult => {
  const origin = useRef<DragOrigin | null>(null);
  const moved = useRef(false);
  const [offset, setOffset] = useState(NO_OFFSET);
  const [dragging, setDragging] = useState(false);

  /** Cell the card's top-left corner is nearest to; may lie outside the grid. */
  const hoveredCell = useCallback(
    ({ dx, dy, cellWidth, cellHeight }: DragOrigin): GridCell => ({
      row: layout.row + Math.round(dy / cellHeight),
      col: layout.col + Math.round(dx / cellWidth),
    }),
    [layout],
  );

  /** `hoveredCell` pulled back inside the grid, where the card lands on release. */
  const targetFor = useCallback(
    (current: DragOrigin): GridCell => {
      const { rowSpan = 1, colSpan = 1 } = layout;
      const { row, col } = hoveredCell(current);
      return {
        row: clamp(row, 1, GRID_ROWS - rowSpan + 1),
        col: clamp(col, 1, GRID_COLS - colSpan + 1),
      };
    },
    [hoveredCell, layout],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      moved.current = false;
      if (!enabled || event.button !== 0) return;
      if ((event.target as HTMLElement).closest('button')) return;
      const grid = event.currentTarget.closest('[data-widget-grid]');
      if (!grid) return;
      const { width, height } = grid.getBoundingClientRect();
      origin.current = {
        dx: 0,
        dy: 0,
        pointerX: event.clientX,
        pointerY: event.clientY,
        cellWidth: width / GRID_COLS,
        cellHeight: height / GRID_ROWS,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      onStart();
      onHover(layout);
    },
    [enabled, layout, onHover, onStart],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = origin.current;
      if (!current) return;
      current.dx = event.clientX - current.pointerX;
      current.dy = event.clientY - current.pointerY;
      if (Math.hypot(current.dx, current.dy) > DRAG_THRESHOLD_PX) moved.current = true;
      setOffset({ dx: current.dx, dy: current.dy });
      onHover({ ...layout, ...hoveredCell(current) });
    },
    [hoveredCell, layout, onHover],
  );

  const finish = useCallback(() => {
    origin.current = null;
    setOffset(NO_OFFSET);
    setDragging(false);
    onHover(null);
    onEnd();
  }, [onEnd, onHover]);

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = origin.current;
      if (!current) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      const target = targetFor(current);
      finish();
      if (moved.current && (target.row !== layout.row || target.col !== layout.col)) onDrop(target);
    },
    [layout, onDrop, finish, targetFor],
  );

  const onClickCapture = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!moved.current) return;
    event.stopPropagation();
    event.preventDefault();
    moved.current = false;
  }, []);

  return {
    dragging,
    offset,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: finish, onClickCapture },
  };
};
