import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';
import type { WidgetType } from '@/features/widgets/widgetSizes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addWidget as addWidgetAction,
  moveWidget as moveWidgetAction,
  removeWidget as removeWidgetAction,
  resizeWidget as resizeWidgetAction,
  setWatchlist as setWatchlistAction,
  setWidgetInstrument,
  type WatchlistSettings,
  type Widget,
} from '@/store/widgetsSlice';
import { useCallback } from 'react';

export type UseWidgetsResult = {
  widgets: Widget[];
  addWidget: (type: WidgetType, cell?: GridCell) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, cell: GridCell) => void;
  resizeWidget: (id: string, layout: WidgetLayout) => void;
  setInstrument: (id: string, productId: string) => void;
  setWatchlist: (id: string, settings: WatchlistSettings) => void;
};

export const useWidgets = (): UseWidgetsResult => {
  const widgets = useAppSelector((state) => state.widgets.items);
  const dispatch = useAppDispatch();

  const addWidget = useCallback(
    (type: WidgetType, cell?: GridCell) => dispatch(addWidgetAction(type, cell)),
    [dispatch],
  );
  const removeWidget = useCallback((id: string) => dispatch(removeWidgetAction(id)), [dispatch]);
  const moveWidget = useCallback(
    (id: string, cell: GridCell) => dispatch(moveWidgetAction({ id, ...cell })),
    [dispatch],
  );
  const resizeWidget = useCallback(
    (id: string, layout: WidgetLayout) => dispatch(resizeWidgetAction({ id, ...layout })),
    [dispatch],
  );
  const setInstrument = useCallback(
    (id: string, productId: string) => dispatch(setWidgetInstrument({ id, productId })),
    [dispatch],
  );

  const setWatchlist = useCallback(
    (id: string, settings: WatchlistSettings) => dispatch(setWatchlistAction({ id, ...settings })),
    [dispatch],
  );

  return { widgets, addWidget, removeWidget, moveWidget, resizeWidget, setInstrument, setWatchlist };
};
