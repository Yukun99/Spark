import { ClearButton } from '@/components/buttons/clearButton';
import { useColorMode } from '@/components/buttons/hooks/useColorMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export const ColorModeToggle = () => {
  const { mode, toggleMode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <ClearButton
      rounded
      onClick={toggleMode}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      sx={{ position: 'absolute', top: 24, right: 24, p: 1 }}
    >
      {isDark ? <DarkModeIcon /> : <LightModeIcon />}
    </ClearButton>
  );
};
