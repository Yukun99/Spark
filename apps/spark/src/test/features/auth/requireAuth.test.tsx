import { ApiError, apiFetch, clearToken, writeToken } from '@/connections/api';
import { RequireAuth } from '@/features/auth/requireAuth';
import { createAppStore } from '@/store/store';
import { installFakeApi } from '@/test/fixtures/mockApi';
import { sampleOrders } from '@/test/fixtures/orders';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

const renderGuarded = () => {
  const store = createAppStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/login' element={<p>login page</p>} />
          <Route
            path='/'
            element={
              <RequireAuth>
                <p>dashboard</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return store;
};

describe('RequireAuth', () => {
  beforeEach(() => clearToken());

  it('redirects to the login page without a token', async () => {
    installFakeApi();
    renderGuarded();
    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('hydrates a stored session before showing the app', async () => {
    const fake = installFakeApi({ orders: sampleOrders() });
    writeToken('stored');
    const store = renderGuarded();
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument();
    expect(await screen.findByText('dashboard')).toBeInTheDocument();
    expect(store.getState().orders.items).toEqual(sampleOrders());
    expect(fake.calls[0]).toEqual({ path: '/auth/me', request: {} });
  });

  it('offers a retry when the data cannot be loaded', async () => {
    const user = userEvent.setup();
    const fake = installFakeApi();
    writeToken('stored');
    vi.mocked(apiFetch).mockImplementation((async (path, request) => {
      if (path === '/orders') throw new ApiError(500, 'Internal server error');
      return fake.handle(path, request);
    }) as typeof apiFetch);
    const store = renderGuarded();

    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(store.getState().notice.message).toBe('Internal server error');
    vi.mocked(apiFetch).mockImplementation(fake.handle);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('dashboard')).toBeInTheDocument();
  });
});
