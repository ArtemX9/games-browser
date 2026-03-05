import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import AppContainer from '@/AppContainer';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { DEFAULT_COLOR_THEME, THEME_STORAGE_KEY } from '@/constants';
import '@/index.css';
import store from '@/store/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider
    defaultTheme={DEFAULT_COLOR_THEME}
    storageKey={THEME_STORAGE_KEY}
  >
    <Provider store={store}>
      <AppContainer />
      <Toaster />
    </Provider>
  </ThemeProvider>,
);
