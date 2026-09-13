import { App } from '@/app';
import { store } from '@/store/store';
import { theme } from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'overlayscrollbars/overlayscrollbars.css';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme} defaultMode='system'>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
