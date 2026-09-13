import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SettingsState = {
  updateIntervalMs: number;
  streaming: boolean;
};

export const UPDATE_INTERVAL_OPTIONS_MS = [250, 500, 1000, 2000, 5000, 10000] as const;

export const DEFAULT_UPDATE_INTERVAL_MS = 1000;

const initialState: SettingsState = {
  updateIntervalMs: DEFAULT_UPDATE_INTERVAL_MS,
  streaming: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replaceSettings: (state, action: PayloadAction<SettingsState>) => {
      state.updateIntervalMs = action.payload.updateIntervalMs;
      state.streaming = action.payload.streaming;
    },
    setUpdateInterval: (state, action: PayloadAction<number>) => {
      state.updateIntervalMs = Math.max(0, action.payload);
    },
    cycleUpdateInterval: (state) => {
      const index = UPDATE_INTERVAL_OPTIONS_MS.indexOf(
        state.updateIntervalMs as (typeof UPDATE_INTERVAL_OPTIONS_MS)[number],
      );
      state.updateIntervalMs =
        UPDATE_INTERVAL_OPTIONS_MS[(index + 1) % UPDATE_INTERVAL_OPTIONS_MS.length];
    },
    toggleStreaming: (state) => {
      state.streaming = !state.streaming;
    },
  },
});

export const { replaceSettings, setUpdateInterval, cycleUpdateInterval, toggleStreaming } =
  settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
