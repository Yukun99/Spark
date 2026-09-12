import type { CSSObject, Theme } from '@mui/material/styles';
// Relative import: `appShell.ts` pulls this into the Vite config, where the `@/` alias is absent.
import { theme as colours } from './palette';

/** `#RRGGBB` to `rgba(r, g, b, a)`, formatted like MUI's `alpha`. */
const alpha = (hex: string, a: number) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const buildShadows = (colour: string) => ({
  sm: `0 1px 3px ${alpha(colour, 0.2)}`,
  md: `0 4px 12px ${alpha(colour, 0.25)}`,
  lg: `0 8px 24px ${alpha(colour, 0.3)}`,
  xl: `0 12px 40px ${alpha(colour, 0.4)}`,
});

export const shadows = {
  light: buildShadows(colours.navy),
  dark: buildShadows(colours.cream),
} as const;

export type ShadowSize = keyof typeof shadows.light;

/** `sx` entry applying the mode-appropriate shadow of the given size. */
export const shadowSx =
  (size: ShadowSize) =>
  (theme: Theme): CSSObject => ({
    boxShadow: shadows.light[size],
    ...theme.applyStyles('dark', { boxShadow: shadows.dark[size] }),
  });
