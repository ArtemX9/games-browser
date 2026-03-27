import { RenderOptions, render } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import { IApplicationState } from '@/store/reducers';
import { storeCreator } from '@/store/store';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<IApplicationState>;
}

export function renderWithProviders(ui: ReactNode, { preloadedState, ...renderOptions }: RenderWithProvidersOptions = {}) {
  const store = storeCreator(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider defaultTheme='system' storageKey='test-theme'>
          {children}
        </ThemeProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
