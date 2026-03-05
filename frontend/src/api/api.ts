import { getGamesURL, getRescanURL } from '@/api/routes';

export const defaultFetchSettings: RequestInit = {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
};

export const getFetchSettings = (method = 'GET', data: any = null) => {
  const settings = {
    ...defaultFetchSettings,
    headers: { ...defaultFetchSettings.headers },
    method: method,
  };
  if (data) {
    if (data instanceof FormData) {
      settings.body = data;
      // let the browser set the content type to ensure the boundary is set correctly
      if ('Content-Type' in settings.headers) {
        delete settings.headers['Content-Type'];
      }
    } else {
      Object.defineProperty(settings, 'body', {
        enumerable: true,
        configurable: false,
        value: JSON.stringify(data),
      });
    }
  }
  return settings;
};

class ApiException {
  status: string;
  text: string;
  url: string;
  method: string;

  constructor(status: string, text: string, url: string, method: string) {
    this.status = status;
    this.text = text;
    this.url = url;
    this.method = method;
  }

  toString() {
    return `${this.status}: ${this.text}`;
  }
}

type FetchOptions = RequestInit & {
  withAbortRethrow?: boolean;
};
const apiFetch = <T = any>(
  url: string,
  method = 'GET',
  body: any = null,
  options: FetchOptions | null = {},
  customSettings: FetchOptions | null = null,
) => {
  const settings = customSettings
    ? customSettings
    : { ...getFetchSettings(method, body), ...options };
  const startTime = new Date().getTime();
  return (
    fetch(url, settings)
      .then((response) => {
        const status = response.status;
        const isJson = response.headers
          .get('content-type')
          ?.includes('application/json');
        if (response.ok && isJson) {
          return response.json().then((json) => [response, status, json]);
        }
        return response.text().then((text) => [response, status, text]);
      })
      // @ts-ignore
      .then(([response, status, value]) => {
        if (response.ok) {
          return value as T;
        }
        throw new ApiException(response.status, value, url, method);
      })
      .catch((error) => {
        if (options?.withAbortRethrow) {
          throw error;
        }
        if (error.name !== 'AbortError') {
          const endTime = new Date().getTime();

          console.error(`[API Error][${error}]`, {
            details: error,
            duration: endTime - startTime,
          });
          return Promise.resolve();
        }
      })
  );
};

export const fetchGamesList = async (signal?: AbortSignal) => {
  const url = getGamesURL();
  return await apiFetch(url, 'GET', null, {
    withAbortRethrow: true,
    signal,
  });
};

export const triggerRescan = async () => {
  const url = getRescanURL();
  return await apiFetch(url, 'GET');
};
