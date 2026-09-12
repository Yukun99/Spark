import { theme as colours } from '@/styles/palette';
import { alpha, type CSSObject, type Theme } from '@mui/material/styles';

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
