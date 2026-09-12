import type { WidgetLayout } from '@/features/grid/gridTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type LayoutState = {
  editMode: boolean;
  dragTarget: WidgetLayout | null;
};

const initialState: LayoutState = {
  editMode: false,
  dragTarget: null,
};

const sameLayout = (a: WidgetLayout | null, b: WidgetLayout | null) =>
  a?.row === b?.row && a?.col === b?.col && a?.rowSpan === b?.rowSpan && a?.colSpan === b?.colSpan;

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.editMode = !state.editMode;
      state.dragTarget = null;
    },
    setDragTarget: (state, action: PayloadAction<WidgetLayout | null>) => {
      if (!sameLayout(state.dragTarget, action.payload)) state.dragTarget = action.payload;
    },
  },
});

export const { toggleEditMode, setDragTarget } = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;
