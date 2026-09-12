import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import type { WidgetLayout } from '@/features/grid/gridTypes';
import type { WidgetSize } from '@/features/widgets/widgetSizes';
import { useCallback, useRef, type PointerEvent } from 'react';

export type ResizeEdge = 'top' | 'bottom' | 'left' | 'right';

type Origin = { pointer: number; start: number; span: number; cellSize: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type UseWidgetResizeParams = {
  layout: WidgetLayout;
  minSize: WidgetSize;
  onResize: (layout: WidgetLayout) => void;
};

export type ResizeHandlers = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
};

export type UseWidgetResizeResult = {
  handlersFor: (edge: ResizeEdge) => ResizeHandlers;
};

/**
 * Drag an edge to snap the widget's span one cell at a time. Top/left edges move the origin as
 * they grow or shrink. Never below `minSize` or past the grid; `onResize` rejects occupied cells.
 */
export const useWidgetResize = ({
  layout,
  minSize,
  onResize,
}: UseWidgetResizeParams): UseWidgetResizeResult => {
  const origin = useRef<Origin | null>(null);
  const { row, col, rowSpan = 1, colSpan = 1 } = layout;

  const handlersFor = useCallback(
    (edge: ResizeEdge): ResizeHandlers => {
      const vertical = edge === 'top' || edge === 'bottom';
      const leading = edge === 'top' || edge === 'left';
      const start = vertical ? row : col;
      const span = vertical ? rowSpan : colSpan;
      const min = vertical ? minSize.rowSpan : minSize.colSpan;
      const gridSize = vertical ? GRID_ROWS : GRID_COLS;
      const pointerOf = (event: PointerEvent<HTMLElement>) =>
        vertical ? event.clientY : event.clientX;

      const finish = () => {
        origin.current = null;
      };

      return {
        onPointerDown: (event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          const grid = event.currentTarget.closest('[data-widget-grid]');
          if (!grid) return;
          const rect = grid.getBoundingClientRect();
          origin.current = {
            pointer: pointerOf(event),
            start,
            span,
            cellSize: vertical ? rect.height / GRID_ROWS : rect.width / GRID_COLS,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        },
        onPointerMove: (event) => {
          const current = origin.current;
          if (!current) return;
          const delta = Math.round((pointerOf(event) - current.pointer) / current.cellSize);
          const end = current.start + current.span - 1;
          const nextSpan = leading
            ? clamp(current.span - delta, min, end)
            : clamp(current.span + delta, min, gridSize - current.start + 1);
          const nextStart = leading ? end - nextSpan + 1 : current.start;
          if (nextSpan === span && nextStart === start) return;
          const base = { row, col, rowSpan, colSpan };
          onResize(
            vertical
              ? { ...base, row: nextStart, rowSpan: nextSpan }
              : { ...base, col: nextStart, colSpan: nextSpan },
          );
        },
        onPointerUp: (event) => {
          if (!origin.current) return;
          event.currentTarget.releasePointerCapture(event.pointerId);
          finish();
        },
        onPointerCancel: finish,
      };
    },
    [col, colSpan, minSize, onResize, row, rowSpan],
  );

  return { handlersFor };
};
