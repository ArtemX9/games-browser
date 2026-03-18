import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGamesList, getFetchSettings, triggerRescan } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(
  body: unknown,
  ok = true,
  status = 200,
  contentType = 'application/json',
) {
  return {
    ok,
    status,
    headers: {
      get: (header: string) => (header === 'content-type' ? contentType : null),
    },
    json: () => Promise.resolve(body),
    text: () =>
      Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

describe('getFetchSettings', () => {
  it('defaults to GET with JSON headers', () => {
    const settings = getFetchSettings();
    expect(settings.method).toBe('GET');
    expect((settings.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
  });

  it('sets JSON body for plain object data', () => {
    const settings = getFetchSettings('POST', { key: 'value' });
    expect(settings.body).toBe('{"key":"value"}');
  });

  it('removes Content-Type header for FormData', () => {
    const formData = new FormData();
    const settings = getFetchSettings('POST', formData);
    expect(
      (settings.headers as Record<string, string>)['Content-Type'],
    ).toBeUndefined();
    expect(settings.body).toBe(formData);
  });
});

describe('fetchGamesList', () => {
  afterEach(() => vi.clearAllMocks());

  it('fetches from /api/games and returns parsed JSON', async () => {
    const games = [{ display_name: 'Hades', platform: 'Win' }];
    mockFetch.mockResolvedValue(makeResponse(games));

    const result = await fetchGamesList();

    expect(mockFetch).toHaveBeenCalledWith('/api/games', expect.any(Object));
    expect(result).toEqual(games);
  });

  it('rethrows AbortError (withAbortRethrow)', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    mockFetch.mockRejectedValue(abortError);

    await expect(fetchGamesList()).rejects.toThrow('Aborted');
  });

  it('passes signal to fetch when provided', async () => {
    mockFetch.mockResolvedValue(makeResponse([]));
    const controller = new AbortController();

    await fetchGamesList(controller.signal);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/games',
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

describe('triggerRescan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches from /api/rescan', async () => {
    mockFetch.mockResolvedValue(makeResponse({ success: true }));

    await triggerRescan();

    expect(mockFetch).toHaveBeenCalledWith('/api/rescan', expect.any(Object));
  });

  it('returns undefined on network error (non-abort errors are swallowed)', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await triggerRescan();

    expect(result).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });

  it('returns undefined on 500 server error', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFetch.mockResolvedValue(
      makeResponse('Internal Server Error', false, 500, 'text/plain'),
    );

    const result = await triggerRescan();

    expect(result).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });
});
