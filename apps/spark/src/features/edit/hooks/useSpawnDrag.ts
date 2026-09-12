import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { useDragTarget } from '@/features/grid/hooks/useDragTarget';
import type { GridCell } from '@/features/grid/gridTypes';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { WIDGET_SIZES, type WidgetType } from '@/features/widgets/widgetSizes';
import { useCallback, useRef, useState, type MouseEvent, type PointerEvent } from 'react';

export type SpawnGhost = { left: number; top: number; width: number; height: number };

type Origin = { pointerX: number; pointerY: number };

const DRAG_THRESHOLD_PX = 4;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const gridElement = () => document.querySelector('[data-widget-grid]');

export type UseSpawnDragParams = {
  type: WidgetType;
};

export type UseSpawnDragResult = {
  ghost: SpawnGhost | null;
  handlers: {
    onClick: () => void;
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: () => void;
    onClickCapture: (event: MouseEvent<HTMLElement>) => void;
  };
};

/**
 * Click adds a widget at the first free spot; press-and-drag carries a ghost of it over the
 * grid and adds it on the hovered cells when released there.
 */
export const useSpawnDrag = ({ type }: UseSpawnDragParams): UseSpawnDragResult => {
  const { addWidget } = useWidgets();
  const { setDragTarget } = useDragTarget();
  const size = WIDGET_SIZES[type];
  const origin = useRef<Origin | null>(null);
  const moved = useRef(false);
  const target = useRef<GridCell | null>(null);
  const [ghost, setGhost] = useState<SpawnGhost | null>(null);

  const onClick = useCallback(() => addWidget(type), [addWidget, type]);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    moved.current = false;
    if (event.button !== 0) return;
    origin.current = { pointerX: event.clientX, pointerY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const current = origin.current;
      const grid = gridElement();
      if (!current || !grid) return;
      const dx = event.clientX - current.pointerX;
      const dy = event.clientY - current.pointerY;
      if (!moved.current && Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) return;
      moved.current = true;

      const rect = grid.getBoundingClientRect();
      const cellWidth = rect.width / GRID_COLS;
      const cellHeight = rect.height / GRID_ROWS;
      const width = cellWidth * size.colSpan;
      const height = cellHeight * size.rowSpan;
      const left = event.clientX - width / 2;
      const top = event.clientY - height / 2;
      setGhost({ left, top, width, height });

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      target.current = inside
        ? {
            row: clamp(Math.round((top - rect.top) / cellHeight) + 1, 1, GRID_ROWS - size.rowSpan + 1),
            col: clamp(Math.round((left - rect.left) / cellWidth) + 1, 1, GRID_COLS - size.colSpan + 1),
          }
        : null;
      setDragTarget(target.current && { ...target.current, ...size });
    },
    [setDragTarget, size],
  );

  const finish = useCallback(() => {
    origin.current = null;
    target.current = null;
    setGhost(null);
    setDragTarget(null);
  }, [setDragTarget]);

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!origin.current) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      const cell = target.current;
      const dragged = moved.current;
      finish();
      if (dragged && cell) addWidget(type, cell);
    },
    [addWidget, finish, type],
  );

  const onClickCapture = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!moved.current) return;
    event.stopPropagation();
    event.preventDefault();
    moved.current = false;
  }, []);

  return {
    ghost,
    handlers: { onClick, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: finish, onClickCapture },
  };
};
