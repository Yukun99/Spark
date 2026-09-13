import { apiFetch } from '@/connections/api';
import { reportApiFailure } from '@/store/apiFailure';
import { hydrationFailed, hydrationFinished, hydrationStarted } from '@/store/authSlice';
import { replaceSettings, type SettingsState } from '@/store/settingsSlice';
import { SEED_WIDGETS } from '@/store/widgetSeed';
import { replaceWidgets, type Widget } from '@/store/widgetsSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';

/** Loads a fresh account with the default layout so the grid is not empty. */
const loadWidgets = async () => {
  const widgets = await apiFetch<Widget[]>('/widgets');
  return widgets.length > 0
    ? widgets
    : apiFetch<Widget[]>('/widgets', { method: 'PUT', body: SEED_WIDGETS });
};

/**
 * Pulls the signed-in user's settings and layout into the store; sync listeners stay quiet until
 * it is done. Orders load once the orders widget knows how many rows fit.
 */
export const hydrateSession = createAsyncThunk('auth/hydrate', async (_, { dispatch }) => {
  dispatch(hydrationStarted());
  try {
    const [settings, widgets] = await Promise.all([
      apiFetch<SettingsState>('/settings'),
      loadWidgets(),
    ]);
    dispatch(replaceSettings(settings));
    dispatch(replaceWidgets(widgets));
    dispatch(hydrationFinished());
  } catch (error) {
    dispatch(hydrationFailed());
    reportApiFailure(dispatch, error, 'Could not load your data');
    throw error;
  }
});
