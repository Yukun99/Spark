import { FilledButton } from '@/components/buttons/filledButton';
import { useColorMode } from '@/hooks/useColorMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export const ColorModeToggle = () => {
  const { mode, toggleMode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <FilledButton
      rounded
      onClick={toggleMode}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      sx={{ position: 'fixed', bottom: 24, right: 24, p: 1 }}
    >
      {isDark ? <DarkModeIcon /> : <LightModeIcon />}
    </FilledButton>
  );
};