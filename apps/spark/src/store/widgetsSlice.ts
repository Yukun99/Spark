import { canPlace, findFreeCell } from '@/features/grid/gridOccupancy';
import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';
import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type InstrumentWidget = {
  id: string;
  type: 'instrument';
  layout: WidgetLayout;
  productId: string;
};

export type Widget = InstrumentWidget;

export type WidgetsState = {
  items: Widget[];
};

export const DEFAULT_PRODUCT_ID = 'BTC-USD';

const initialState: WidgetsState = {
  items: [
    { id: 'initial', type: 'instrument', layout: { row: 1, col: 1 }, productId: DEFAULT_PRODUCT_ID },
  ],
};

export const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addInstrumentWidget: {
      reducer: (state, action: PayloadAction<{ id: string }>) => {
        const cell = findFreeCell(state.items.map((widget) => widget.layout));
        if (!cell) return;
        state.items.push({
          id: action.payload.id,
          type: 'instrument',
          layout: cell,
          productId: DEFAULT_PRODUCT_ID,
        });
      },
      prepare: () => ({ payload: { id: nanoid() } }),
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
    setWidgetInstrument: (state, action: PayloadAction<{ id: string; productId: string }>) => {
      const widget = state.items.find((item) => item.id === action.payload.id);
      if (widget) widget.productId = action.payload.productId;
    },
  },
});

export const { addInstrumentWidget, removeWidget, moveWidget, setWidgetInstrument } =
  widgetsSlice.actions;
export const widgetsReducer = widgetsSlice.reducer;
