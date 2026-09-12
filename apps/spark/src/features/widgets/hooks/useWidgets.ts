import type { GridCell } from '@/features/grid/gridTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addInstrumentWidget,
  moveWidget as moveWidgetAction,
  removeWidget as removeWidgetAction,
  setWidgetInstrument,
  type Widget,
} from '@/store/widgetsSlice';
import { useCallback } from 'react';

export type UseWidgetsResult = {
  widgets: Widget[];
  addWidget: () => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, cell: GridCell) => void;
  setInstrument: (id: string, productId: string) => void;
};

export const useWidgets = (): UseWidgetsResult => {
  const widgets = useAppSelector((state) => state.widgets.items);
  const dispatch = useAppDispatch();

  const addWidget = useCallback(() => dispatch(addInstrumentWidget()), [dispatch]);
  const removeWidget = useCallback((id: string) => dispatch(removeWidgetAction(id)), [dispatch]);
  const moveWidget = useCallback(
    (id: string, cell: GridCell) => dispatch(moveWidgetAction({ id, ...cell })),
    [dispatch],
  );
  const setInstrument = useCallback(
    (id: string, productId: string) => dispatch(setWidgetInstrument({ id, productId })),
    [dispatch],
  );

  return { widgets, addWidget, removeWidget, moveWidget, setInstrument };
};
