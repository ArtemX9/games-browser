import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import '@/index.css';
import store from '@/store/store';
import AppContainer from '@/AppContainer';
import {ThemeProvider} from '@/components/ThemeProvider/ThemeProvider';
import {DEFAULT_COLOR_THEME, THEME_STORAGE_KEY} from '@/constants';

ReactDOM.createRoot(document.getElementById('root')!).render(<ThemeProvider
    defaultTheme={DEFAULT_COLOR_THEME}
    storageKey={THEME_STORAGE_KEY}
><Provider store={store}>
    <AppContainer/>
</Provider></ThemeProvider>);