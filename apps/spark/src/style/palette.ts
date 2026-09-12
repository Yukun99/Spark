export const theme = {
  navy: '#1C1A33',
  cream: '#EFECDF',
  purple: '#6A1B9A',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const black = {
  10: 'rgba(0, 0, 0, 0.1)',
  20: 'rgba(0, 0, 0, 0.2)',
  30: 'rgba(0, 0, 0, 0.3)',
  40: 'rgba(0, 0, 0, 0.4)',
  50: 'rgba(0, 0, 0, 0.5)',
  60: 'rgba(0, 0, 0, 0.6)',
  70: 'rgba(0, 0, 0, 0.7)',
  80: 'rgba(0, 0, 0, 0.8)',
  90: 'rgba(0, 0, 0, 0.9)',
  100: 'rgba(0, 0, 0, 1)',
} as const;

export const white = {
  10: 'rgba(255, 255, 255, 0.1)',
  20: 'rgba(255, 255, 255, 0.2)',
  30: 'rgba(255, 255, 255, 0.3)',
  40: 'rgba(255, 255, 255, 0.4)',
  50: 'rgba(255, 255, 255, 0.5)',
  60: 'rgba(255, 255, 255, 0.6)',
  70: 'rgba(255, 255, 255, 0.7)',
  80: 'rgba(255, 255, 255, 0.8)',
  90: 'rgba(255, 255, 255, 0.9)',
  100: 'rgba(255, 255, 255, 1)',
} as const;

export const palette = { theme, black, white } as const;

export type ThemeColour = keyof typeof theme;
export type OpacityStep = keyof typeof black;
export type Palette = typeof palette;
