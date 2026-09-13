import { ApiError } from '@/connections/api';
import { hydrateSession } from '@/store/hydrate';
import { createAppStore } from '@/store/store';
import { SEED_WIDGETS } from '@/store/widgetSeed';
import { installFakeApi } from '@/test/fixtures/mockApi';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

describe('hydrateSession', () => {
  it('loads settings and widgets, seeding the layout for a fresh account', async () => {
    const fake = installFakeApi({ settings: { updateIntervalMs: 2000, streaming: false } });
    const store = createAppStore();
    const pending = store.dispatch(hydrateSession());
    expect(store.getState().auth.hydration).toBe('loading');
    await pending;

    expect(store.getState().auth.hydration).toBe('done');
    expect(store.getState().orders.items).toEqual([]);
    expect(store.getState().settings).toEqual({ updateIntervalMs: 2000, streaming: false });
    expect(store.getState().widgets.items).toEqual(SEED_WIDGETS);
    expect(fake.calls.map((call) => `${call.request.method ?? 'GET'} ${call.path}`)).toEqual([
      'GET /settings',
      'GET /widgets',
      'PUT /widgets',
    ]);
    expect(fake.state.widgets).toEqual(SEED_WIDGETS);
  });

  it('keeps a stored layout as is', async () => {
    const widgets = [SEED_WIDGETS[0]];
    installFakeApi({ widgets });
    const store = createAppStore();
    await store.dispatch(hydrateSession());
    expect(store.getState().widgets.items).toEqual(widgets);
  });

  it('marks the hydration failed with a notice when a request fails', async () => {
    const fake = installFakeApi();
    fake.failWith(new ApiError(500, 'Internal server error'));
    const store = createAppStore();
    await store.dispatch(hydrateSession());
    expect(store.getState().auth.hydration).toBe('failed');
    expect(store.getState().notice.message).toBe('Internal server error');
  });
});
