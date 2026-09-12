import { layoutReducer } from '@/store/layoutSlice';
import { configureStore } from '@reduxjs/toolkit';

export const createAppStore = () =>
  configureStore({
    reducer: {
      layout: layoutReducer,
    },
  });

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
