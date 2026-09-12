import { gray, theme as colours } from '@/styles/palette';
import { createTheme } from '@mui/material/styles';

const primary = { main: colours.purple, contrastText: colours.cream };
const common = { black: colours.black, white: colours.white };

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
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
