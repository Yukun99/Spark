import { ApiError, clearToken, readToken } from '@/connections/api';
import { LoginPage } from '@/features/auth/loginPage';
import { createAppStore } from '@/store/store';
import { installFakeApi } from '@/test/fixtures/mockApi';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/connections/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/connections/api')>()),
  apiFetch: vi.fn(),
}));

const renderAt = (path: string) => {
  const store = createAppStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path='/login' element={<LoginPage mode='login' />} />
          <Route path='/register' element={<LoginPage mode='register' />} />
          <Route path='/' element={<p>dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return store;
};

const field = (name: string) => screen.getByLabelText(name);

describe('LoginPage', () => {
  beforeEach(() => {
    clearToken();
    installFakeApi();
  });

  it('validates as the user types and only enables the button once valid', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Sign in' });
    expect(submit).toBeDisabled();

    await user.type(field('Username'), 'ab');
    expect(screen.getByText('3 to 32 letters, digits or underscores')).toBeInTheDocument();
    await user.type(field('Username'), 'c');
    expect(screen.queryByText('3 to 32 letters, digits or underscores')).not.toBeInTheDocument();
    await user.type(field('Password'), 'short');
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(submit).toBeDisabled();
    await user.type(field('Password'), 'enough');
    expect(submit).toBeEnabled();
  });

  it('drops typed spaces with a warning and caps both fields at 32 characters', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    expect(field('Username')).toHaveAttribute('maxlength', '32');
    expect(field('Password')).toHaveAttribute('maxlength', '32');

    await user.type(field('Username'), 'yukun ');
    expect(field('Username')).toHaveValue('yukun');
    expect(screen.getByText('Spaces are not allowed')).toBeInTheDocument();
    await user.type(field('Username'), 'x');
    expect(field('Username')).toHaveValue('yukunx');
    expect(screen.queryByText('Spaces are not allowed')).not.toBeInTheDocument();

    await user.type(field('Password'), 'pass word ');
    expect(field('Password')).toHaveValue('password');
    expect(screen.getByText('Spaces are not allowed')).toBeInTheDocument();
    await user.paste('12345678901234567890123456789');
    expect(field('Password')).toHaveValue('password123456789012345678901234');
    expect(screen.queryByText('Spaces are not allowed')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('signs in, stores the token and moves to the dashboard', async () => {
    const user = userEvent.setup();
    const store = renderAt('/login');
    await user.type(field('Username'), 'yukun');
    await user.type(field('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('dashboard')).toBeInTheDocument();
    expect(readToken()).toBe('fake-token');
    expect(store.getState().auth).toMatchObject({ status: 'signedIn', user: { username: 'yukun' } });
  });

  it('reports a rejected login through the notice and stays on the page', async () => {
    const user = userEvent.setup();
    const fake = installFakeApi();
    fake.failWith(new ApiError(401, 'Invalid username or password'));
    const store = renderAt('/login');
    await user.type(field('Username'), 'yukun');
    await user.type(field('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(store.getState().notice.message).toBe('Invalid username or password'));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(readToken()).toBeNull();
  });

  it('switches to account creation, which needs matching passwords', async () => {
    const user = userEvent.setup();
    const store = renderAt('/login');
    await user.click(screen.getByRole('button', { name: 'Create an account' }));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();

    await user.type(field('Username'), 'newbie');
    await user.type(field('Password'), 'password123');
    await user.type(field('Confirm password'), 'password124');
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled();
    await user.clear(field('Confirm password'));
    await user.type(field('Confirm password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('dashboard')).toBeInTheDocument();
    expect(store.getState().auth.user).toMatchObject({ username: 'newbie' });
  });

  it('sends an already signed-in visitor straight to the dashboard', async () => {
    const fake = installFakeApi();
    fake.state.token = 'stored';
    localStorage.setItem('spark-token', 'stored');
    renderAt('/register');
    expect(await screen.findByText('dashboard')).toBeInTheDocument();
  });
});
