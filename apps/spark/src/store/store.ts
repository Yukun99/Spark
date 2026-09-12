import { layoutReducer } from '@/store/layoutSlice';
import { settingsReducer } from '@/store/settingsSlice';
import { widgetsReducer } from '@/store/widgetsSlice';
import { configureStore } from '@reduxjs/toolkit';

export const createAppStore = () =>
  configureStore({
    reducer: {
      layout: layoutReducer,
      settings: settingsReducer,
      widgets: widgetsReducer,
    },
  });

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
