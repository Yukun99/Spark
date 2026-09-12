import { theme as colours } from '@/style/palette';
import { createTheme } from '@mui/material/styles';

const primary = { main: colours.purple, contrastText: colours.cream };

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: {
    light: {
      palette: {
        primary,
        background: { default: colours.cream },
        text: { primary: colours.navy },
      },
    },
    dark: {
      palette: {
        primary,
        background: { default: colours.navy },
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
      },
    },
  },
});
