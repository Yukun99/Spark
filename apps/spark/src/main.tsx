import { App } from '@/app';
import { theme } from '@/style/theme';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <InitColorSchemeScript />
    <ThemeProvider theme={theme} defaultMode='system'>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
