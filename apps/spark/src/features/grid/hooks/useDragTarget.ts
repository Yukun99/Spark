import type { WidgetLayout } from '@/features/grid/gridTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDragTarget as setDragTargetAction } from '@/store/layoutSlice';
import { useCallback } from 'react';

export type UseDragTargetResult = {
  dragTarget: WidgetLayout | null;
  setDragTarget: (target: WidgetLayout | null) => void;
};

/** The grid area a dragged widget currently hovers, so placeholders can react. */
export const useDragTarget = (): UseDragTargetResult => {
  const dragTarget = useAppSelector((state) => state.layout.dragTarget);
  const dispatch = useAppDispatch();
  const setDragTarget = useCallback(
    (target: WidgetLayout | null) => dispatch(setDragTargetAction(target)),
    [dispatch],
  );

  return { dragTarget, setDragTarget };
};
