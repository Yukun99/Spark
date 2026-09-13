import { ApiError } from '@/connections/api';
import { hydrationFinished } from '@/store/authSlice';
import { toggleStreaming } from '@/store/settingsSlice';
import { createAppStore } from '@/store/store';
import { WIDGET_SYNC_DELAY_MS } from '@/store/syncListener';
import { moveWidget, removeWidget } from '@/store/widgetsSlice';
import { installFakeApi } from '@/test/fixtures/mockApi';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

const hydratedStore = () => {
  const store = createAppStore();
  store.dispatch(hydrationFinished());
  return store;
};

/** Lets the listener's awaited request settle under fake timers. */
const flush = () => vi.advanceTimersByTimeAsync(1);

describe('syncListener', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('stays quiet until the session is hydrated', async () => {
    const fake = installFakeApi();
    const store = createAppStore();
    store.dispatch(toggleStreaming());
    store.dispatch(removeWidget('eth'));
    await vi.advanceTimersByTimeAsync(WIDGET_SYNC_DELAY_MS * 2);
    expect(fake.calls).toEqual([]);
  });

  it('puts the settings after every change and reverts them when the put fails', async () => {
    const fake = installFakeApi();
    const store = hydratedStore();
    store.dispatch(toggleStreaming());
    await flush();
    expect(fake.calls).toEqual([
      { path: '/settings', request: { method: 'PUT', body: { updateIntervalMs: 1000, streaming: false } } },
    ]);

    fake.failWith(new ApiError(500, 'Internal server error'));
    store.dispatch(toggleStreaming());
    expect(store.getState().settings.streaming).toBe(true);
    await flush();
    expect(store.getState().settings.streaming).toBe(false);
    expect(store.getState().notice.message).toBe('Internal server error');
  });

  it('debounces a burst of layout edits into one put of the final layout', async () => {
    const fake = installFakeApi();
    const store = hydratedStore();
    store.dispatch(moveWidget({ id: 'initial', row: 1, col: 1 }));
    await vi.advanceTimersByTimeAsync(WIDGET_SYNC_DELAY_MS / 2);
    store.dispatch(removeWidget('eth'));
    await vi.advanceTimersByTimeAsync(WIDGET_SYNC_DELAY_MS / 2);
    expect(fake.calls).toEqual([]);
    await vi.advanceTimersByTimeAsync(WIDGET_SYNC_DELAY_MS / 2);
    expect(fake.calls).toEqual([
      { path: '/widgets', request: { method: 'PUT', body: store.getState().widgets.items } },
    ]);
    expect(fake.state.widgets.map((widget) => widget.id)).toEqual(['initial', 'common', 'orders']);
  });

  it('restores the layout from before the burst when the put fails', async () => {
    const fake = installFakeApi();
    const store = hydratedStore();
    const before = store.getState().widgets.items;
    fake.failWith(new ApiError(500, 'Internal server error'));
    store.dispatch(removeWidget('eth'));
    store.dispatch(removeWidget('common'));
    await vi.advanceTimersByTimeAsync(WIDGET_SYNC_DELAY_MS);
    expect(store.getState().widgets.items).toEqual(before);
    expect(store.getState().notice.message).toBe('Internal server error');
  });

  it('signs out when the server no longer accepts the token', async () => {
    const fake = installFakeApi();
    const store = hydratedStore();
    fake.failWith(new ApiError(401, 'Invalid or expired token'));
    store.dispatch(toggleStreaming());
    await flush();
    expect(store.getState().auth.status).toBe('signedOut');
  });
});
