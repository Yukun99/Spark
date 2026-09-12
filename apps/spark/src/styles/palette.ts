export const theme = {
  navy: '#1C1A33',
  cream: '#EFECDF',
  purple: '#6A1B9A',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const gray = {
  10: '#E6E6E6',
  20: '#CCCCCC',
  30: '#B3B3B3',
  40: '#999999',
  50: '#808080',
  60: '#666666',
  70: '#4D4D4D',
  80: '#333333',
  90: '#1A1A1A',
  100: '#000000',
} as const;

/** Translucent purple laid over a widget right after a tick; fades to nothing when idle. */
export const glow = {
  light: 'rgba(106, 27, 154, 0.3)',
  dark: 'rgba(106, 27, 154, 0.45)',
} as const;

/** Buy/sell chip backgrounds: pale on light mode (navy text), deep on dark mode (cream text). */
export const trade = {
  buy: { light: '#A5D6A7', dark: '#2E7D32' },
  sell: { light: '#EF9A9A', dark: '#C62828' },
} as const;

export const palette = { theme, gray, glow, trade } as const;

export type ThemeColour = keyof typeof theme;
export type GrayStep = keyof typeof gray;
export type Palette = typeof palette;
