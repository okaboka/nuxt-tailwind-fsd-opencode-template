import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from 'app/providers/api/apiFetch';

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('подставляет baseURL и возвращает результат $fetch', async () => {
    const response = [{ id: 1, title: 'Демо' }];
    const fetchMock = vi.fn().mockResolvedValue(response);

    vi.stubGlobal('$fetch', fetchMock);

    const result = await apiFetch('/demo/list');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/demo/list', {
      baseURL: 'https://example.com/api',
    });
    expect(result).toEqual(response);
  });
});
