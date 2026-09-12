import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SettingsState = {
  updateIntervalMs: number;
};

export const DEFAULT_UPDATE_INTERVAL_MS = 10000;

const initialState: SettingsState = {
  updateIntervalMs: DEFAULT_UPDATE_INTERVAL_MS,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUpdateInterval: (state, action: PayloadAction<number>) => {
      state.updateIntervalMs = Math.max(0, action.payload);
    },
  },
});

export const { setUpdateInterval } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
