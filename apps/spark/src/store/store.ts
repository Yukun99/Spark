import { authReducer, sessionCleared } from '@/store/authSlice';
import { layoutReducer } from '@/store/layoutSlice';
import { noticeReducer } from '@/store/noticeSlice';
import { ordersReducer } from '@/store/ordersSlice';
import { settingsReducer } from '@/store/settingsSlice';
import { syncListener } from '@/store/syncListener';
import { widgetsReducer } from '@/store/widgetsSlice';
import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';

const appReducer = combineReducers({
  auth: authReducer,
  layout: layoutReducer,
  notice: noticeReducer,
  orders: ordersReducer,
  settings: settingsReducer,
  widgets: widgetsReducer,
});

/** Every slice returns to its initial state when the session ends, so no user data lingers. */
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) =>
  appReducer(sessionCleared.match(action) ? undefined : state, action);

export const createAppStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(syncListener.middleware),
  });

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = AppStore['dispatch'];
