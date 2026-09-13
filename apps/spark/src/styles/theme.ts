import { fonts } from '@/styles/fonts';
import { gray, theme as colours } from '@/styles/palette';
import { createTheme, type Theme } from '@mui/material/styles';
import '@mui/x-date-pickers/themeAugmentation';

const primary = { main: colours.purple, contrastText: colours.cream };
const common = { black: colours.black, white: colours.white };
const DIALOG_BACKDROP_BLUR_PX = 4;

/** Focused outline in the theme's text colour; `outline` is the notched-outline class of the input. */
const focusedOutline =
  (outline: string) =>
  ({ theme }: { theme: Theme }) => ({
    [`&.Mui-focused:not(.Mui-error) .${outline}`]: { borderColor: colours.navy },
    ...theme.applyStyles('dark', { [`&.Mui-focused:not(.Mui-error) .${outline}`]: { borderColor: colours.cream } }),
  });

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  typography: { fontFamily: fonts.ui },
  colorSchemes: {
    light: {
      palette: {
        primary,
        common,
        background: { default: gray[10] },
        text: { primary: colours.navy },
      },
    },
    dark: {
      palette: {
        primary,
        common,
        background: { default: gray[80] },
        text: { primary: colours.cream },
      },
    },
  },
  components: {
    MuiModal: { defaultProps: { disableScrollLock: true } },
    MuiDialog: {
      defaultProps: { disableScrollLock: true },
      styleOverrides: { backdrop: { backdropFilter: `blur(${DIALOG_BACKDROP_BLUR_PX}px)` } },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: colours.cream,
          color: colours.navy,
          ...theme.applyStyles('dark', { backgroundColor: colours.navy, color: colours.cream }),
        }),
      },
    },
    // Focused fields and group labels use the theme's text colour so focus is unmistakable.
    MuiOutlinedInput: {
      styleOverrides: { root: focusedOutline('MuiOutlinedInput-notchedOutline') },
    },
    MuiPickersOutlinedInput: {
      styleOverrides: { root: focusedOutline('MuiPickersOutlinedInput-notchedOutline') },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused': { color: colours.navy },
          ...theme.applyStyles('dark', { '&.Mui-focused': { color: colours.cream } }),
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 3,
          minWidth: 0,
          width: 'fit-content',
          textTransform: 'none',
        },
        outlined: {
          borderColor: colours.purple,
          backgroundColor: colours.cream,
          color: colours.navy,
          '&:hover': { borderColor: colours.purple, backgroundColor: colours.cream },
        },
        contained: {
          backgroundColor: colours.purple,
          color: colours.cream,
          '&:hover': { backgroundColor: colours.purple },
        },
        text: ({ theme }) => ({
          backgroundColor: 'transparent',
          color: colours.navy,
          '&:hover': { backgroundColor: 'transparent' },
          ...theme.applyStyles('dark', { color: colours.cream }),
        }),
      },
    },
  },
});
