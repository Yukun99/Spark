import type { WidgetLayout } from '@/features/grid/gridTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setDragSource as setDragSourceAction,
  setDragTarget as setDragTargetAction,
} from '@/store/layoutSlice';
import { useCallback } from 'react';

export type UseDragTargetResult = {
  dragSource: WidgetLayout | null;
  dragTarget: WidgetLayout | null;
  setDragSource: (source: WidgetLayout | null) => void;
  setDragTarget: (target: WidgetLayout | null) => void;
};

/** Where a dragged widget came from and the grid area it currently hovers, for placeholders. */
export const useDragTarget = (): UseDragTargetResult => {
  const dragSource = useAppSelector((state) => state.layout.dragSource);
  const dragTarget = useAppSelector((state) => state.layout.dragTarget);
  const dispatch = useAppDispatch();
  const setDragSource = useCallback(
    (source: WidgetLayout | null) => dispatch(setDragSourceAction(source)),
    [dispatch],
  );
  const setDragTarget = useCallback(
    (target: WidgetLayout | null) => dispatch(setDragTargetAction(target)),
    [dispatch],
  );

  return { dragSource, dragTarget, setDragSource, setDragTarget };
};
