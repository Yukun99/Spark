import type { WidgetLayout } from '@/features/grid/gridTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type LayoutState = {
  editMode: boolean;
  dragSource: WidgetLayout | null;
  dragTarget: WidgetLayout | null;
};

const initialState: LayoutState = {
  editMode: false,
  dragSource: null,
  dragTarget: null,
};

export const sameLayout = (a: WidgetLayout | null, b: WidgetLayout | null) =>
  a?.row === b?.row && a?.col === b?.col && a?.rowSpan === b?.rowSpan && a?.colSpan === b?.colSpan;

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.editMode = !state.editMode;
      state.dragSource = null;
      state.dragTarget = null;
    },
    /** Layout a widget is being dragged away from, so its cells can show placeholders. */
    setDragSource: (state, action: PayloadAction<WidgetLayout | null>) => {
      if (!sameLayout(state.dragSource, action.payload)) state.dragSource = action.payload;
    },
    setDragTarget: (state, action: PayloadAction<WidgetLayout | null>) => {
      if (!sameLayout(state.dragTarget, action.payload)) state.dragTarget = action.payload;
    },
  },
});

export const { toggleEditMode, setDragSource, setDragTarget } = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;
