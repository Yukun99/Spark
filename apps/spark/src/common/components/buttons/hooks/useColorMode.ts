import { useColorScheme } from '@mui/material/styles';
import { useCallback } from 'react';

export type ColorMode = 'light' | 'dark';

export type UseColorModeResult = {
  mode: ColorMode;
  toggleMode: () => void;
};

export const useColorMode = (): UseColorModeResult => {
  const { mode, systemMode, setMode } = useColorScheme();
  const resolvedMode: ColorMode = (mode === 'system' ? systemMode : mode) ?? 'light';

  const toggleMode = useCallback(
    () => setMode(resolvedMode === 'dark' ? 'light' : 'dark'),
    [resolvedMode, setMode],
  );

  return { mode: resolvedMode, toggleMode };
};
