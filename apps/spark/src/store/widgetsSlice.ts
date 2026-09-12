import { canPlace, findFreeCell } from '@/features/grid/gridOccupancy';
import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';
import { WIDGET_SIZES, type WidgetType } from '@/features/widgets/widgetSizes';
import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type InstrumentWidget = {
  id: string;
  type: 'instrument';
  layout: WidgetLayout;
  productId: string;
};

export type WatchlistWidget = {
  id: string;
  type: 'watchlist';
  layout: WidgetLayout;
  productIds: string[];
};

export type Widget = InstrumentWidget | WatchlistWidget;

export type WidgetsState = {
  items: Widget[];
};

export const DEFAULT_PRODUCT_ID = 'BTC-USD';

const initialState: WidgetsState = {
  items: [
    { id: 'initial', type: 'instrument', layout: { row: 1, col: 1 }, productId: DEFAULT_PRODUCT_ID },
  ],
};

const createWidget = (id: string, type: WidgetType, layout: WidgetLayout): Widget =>
  type === 'instrument'
    ? { id, type, layout, productId: DEFAULT_PRODUCT_ID }
    : { id, type, layout, productIds: [] };

export type AddWidgetPayload = { id: string; type: WidgetType; cell?: GridCell };

export const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget: {
      /** Places at `cell` when given and free, otherwise at the first cell where the widget fits. */
      reducer: (state, action: PayloadAction<AddWidgetPayload>) => {
        const { id, type, cell } = action.payload;
        const size = WIDGET_SIZES[type];
        const layouts = state.items.map((widget) => widget.layout);
        if (cell && !canPlace(layouts, { ...cell, ...size })) return;
        const target = cell ?? findFreeCell(layouts, size);
        if (!target) return;
        state.items.push(createWidget(id, type, { ...target, ...size }));
      },
      prepare: (type: WidgetType, cell?: GridCell) => ({ payload: { id: nanoid(), type, cell } }),
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((widget) => widget.id !== action.payload);
    },
    moveWidget: (state, action: PayloadAction<{ id: string } & GridCell>) => {
      const { id, row, col } = action.payload;
      const widget = state.items.find((item) => item.id === id);
      if (!widget) return;
      const others = state.items.filter((item) => item.id !== id).map((item) => item.layout);
      const target = { ...widget.layout, row, col };
      if (canPlace(others, target)) widget.layout = target;
    },
    /** Applies a new layout from an edge drag when it keeps the type minimum and stays clear. */
    resizeWidget: (state, action: PayloadAction<{ id: string } & WidgetLayout>) => {
      const { id, ...target } = action.payload;
      const widget = state.items.find((item) => item.id === id);
      if (!widget) return;
      const min = WIDGET_SIZES[widget.type];
      if ((target.rowSpan ?? 1) < min.rowSpan || (target.colSpan ?? 1) < min.colSpan) return;
      const others = state.items.filter((item) => item.id !== id).map((item) => item.layout);
      if (canPlace(others, target)) widget.layout = target;
    },
    setWidgetInstrument: (state, action: PayloadAction<{ id: string; productId: string }>) => {
      const widget = state.items.find((item) => item.id === action.payload.id);
      if (widget?.type === 'instrument') widget.productId = action.payload.productId;
    },
  },
});

export const { addWidget, removeWidget, moveWidget, resizeWidget, setWidgetInstrument } =
  widgetsSlice.actions;
export const widgetsReducer = widgetsSlice.reducer;
