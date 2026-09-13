import { apiFetch } from '@/connections/api';
import { reportApiFailure } from '@/store/apiFailure';
import {
  cycleUpdateInterval,
  replaceSettings,
  setUpdateInterval,
  toggleStreaming,
} from '@/store/settingsSlice';
import type { AppDispatch, RootState } from '@/store/store';
import {
  addWidget,
  moveWidget,
  removeWidget,
  replaceWidgets,
  resizeWidget,
  setWatchlist,
  setWidgetInstrument,
  type Widget,
} from '@/store/widgetsSlice';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

/** Layout edits arrive in bursts (drags, resizes); one PUT per quiet spell is plenty. */
export const WIDGET_SYNC_DELAY_MS = 500;

/** Pushes settings and layout changes to the API once the session is hydrated. */
export const syncListener = createListenerMiddleware();

const startListening = syncListener.startListening.withTypes<RootState, AppDispatch>();

const isHydrated = (state: RootState) => state.auth.hydration === 'done';

/** Layout before the current burst of edits; a failed put restores it, not just the last edit. */
let burstOriginal: Widget[] | null = null;

startListening({
  matcher: isAnyOf(setUpdateInterval, cycleUpdateInterval, toggleStreaming),
  effect: async (_, { dispatch, getState, getOriginalState }) => {
    if (!isHydrated(getState())) return;
    const original = getOriginalState().settings;
    const { updateIntervalMs, streaming } = getState().settings;
    try {
      await apiFetch('/settings', { method: 'PUT', body: { updateIntervalMs, streaming } });
    } catch (error) {
      dispatch(replaceSettings(original));
      reportApiFailure(dispatch, error, 'Could not save your settings');
    }
  },
});

startListening({
  matcher: isAnyOf(
    addWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    setWidgetInstrument,
    setWatchlist,
  ),
  effect: async (_, listenerApi) => {
    const { dispatch, getState, getOriginalState } = listenerApi;
    if (!isHydrated(getState())) return;
    burstOriginal ??= getOriginalState().widgets.items;
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(WIDGET_SYNC_DELAY_MS);
    const original = burstOriginal;
    burstOriginal = null;
    try {
      await apiFetch('/widgets', { method: 'PUT', body: getState().widgets.items });
    } catch (error) {
      if (original !== null) dispatch(replaceWidgets(original));
      reportApiFailure(dispatch, error, 'Could not save your layout');
    }
  },
});
