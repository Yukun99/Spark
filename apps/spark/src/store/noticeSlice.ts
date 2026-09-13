import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type NoticeState = {
  /** Error shown in the snackbar; null when nothing to show. */
  message: string | null;
};

const initialState: NoticeState = { message: null };

export const noticeSlice = createSlice({
  name: 'notice',
  initialState,
  reducers: {
    showNotice: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearNotice: (state) => {
      state.message = null;
    },
  },
});

export const { showNotice, clearNotice } = noticeSlice.actions;
export const noticeReducer = noticeSlice.reducer;
