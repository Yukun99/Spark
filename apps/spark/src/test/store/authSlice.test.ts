import { ApiError, clearToken, readToken, writeToken } from '@/connections/api';
import { login, logout, register, restoreSession, sessionCleared } from '@/store/authSlice';
import { toggleStreaming } from '@/store/settingsSlice';
import { createAppStore } from '@/store/store';
import { installFakeApi } from '@/test/fixtures/mockApi';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

const credentials = { username: 'yukun', password: 'password123' };

describe('authSlice', () => {
  beforeEach(() => clearToken());

  it('starts unknown and signs out when no token is stored', async () => {
    installFakeApi();
    const store = createAppStore();
    expect(store.getState().auth).toEqual({ status: 'unknown', user: null, hydration: 'pending' });
    await store.dispatch(restoreSession());
    expect(store.getState().auth.status).toBe('signedOut');
  });

  it('restores the user behind a stored token, dropping it when rejected', async () => {
    const fake = installFakeApi();
    writeToken('stored');
    const store = createAppStore();
    await store.dispatch(restoreSession());
    expect(store.getState().auth).toMatchObject({ status: 'signedIn', user: fake.state.user });
    expect(fake.calls).toEqual([{ path: '/auth/me', request: {} }]);

    fake.failWith(new ApiError(401, 'Invalid or expired token'));
    const again = createAppStore();
    await again.dispatch(restoreSession());
    expect(again.getState().auth.status).toBe('signedOut');
    expect(readToken()).toBeNull();
  });

  it('logs in and registers without a token, storing the one handed out', async () => {
    for (const [thunk, path] of [
      [login, '/auth/login'],
      [register, '/auth/register'],
    ] as const) {
      clearToken();
      const fake = installFakeApi();
      const store = createAppStore();
      const result = await store.dispatch(thunk(credentials));
      expect(thunk.fulfilled.match(result)).toBe(true);
      expect(readToken()).toBe(fake.state.token);
      expect(store.getState().auth).toMatchObject({
        status: 'signedIn',
        user: { username: 'yukun' },
        hydration: 'pending',
      });
      expect(fake.calls).toEqual([{ path, request: { method: 'POST', body: credentials, auth: false } }]);
    }
  });

  it('rejects a bad login with the server message and stays signed out', async () => {
    const fake = installFakeApi();
    fake.failWith(new ApiError(401, 'Invalid username or password'));
    const store = createAppStore();
    const result = await store.dispatch(login(credentials));
    expect(result).toMatchObject({ payload: 'Invalid username or password' });
    expect(store.getState().auth.status).toBe('unknown');
    expect(readToken()).toBeNull();
  });

  it('logs out, dropping the token and resetting every slice', async () => {
    const fake = installFakeApi();
    const store = createAppStore();
    await store.dispatch(login(credentials));
    store.dispatch(toggleStreaming());
    await store.dispatch(logout());
    expect(fake.calls.at(-1)).toEqual({ path: '/auth/logout', request: { method: 'POST' } });
    expect(readToken()).toBeNull();
    expect(store.getState().auth).toEqual({ status: 'signedOut', user: null, hydration: 'pending' });
    expect(store.getState().settings.streaming).toBe(true);
  });

  it('resets on sessionCleared even without a logout call', () => {
    const store = createAppStore();
    store.dispatch(toggleStreaming());
    store.dispatch(sessionCleared());
    expect(store.getState().settings.streaming).toBe(true);
    expect(store.getState().auth.status).toBe('signedOut');
  });
});
