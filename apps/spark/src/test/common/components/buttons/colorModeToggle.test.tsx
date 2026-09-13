import { ColorModeToggle } from '@/common/components/buttons/colorModeToggle';
import { theme } from '@/styles/theme';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const renderToggle = () =>
  render(
    <ThemeProvider theme={theme} defaultMode='light'>
      <ColorModeToggle />
    </ThemeProvider>,
  );

describe('ColorModeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  });

  it('switches the document colour scheme between light and dark', async () => {
    const user = userEvent.setup();
    renderToggle();

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    await user.click(button);

    expect(document.documentElement.getAttribute('data-mui-color-scheme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement.getAttribute('data-mui-color-scheme')).toBe('light');
  });
});