import { createSlice } from '@reduxjs/toolkit';

export type LayoutState = {
  editMode: boolean;
};

const initialState: LayoutState = {
  editMode: false,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.editMode = !state.editMode;
    },
  },
});

export const { toggleEditMode } = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;
