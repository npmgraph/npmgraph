import { afterEach, describe, expect, it, vi } from 'vitest';
import fetchJson from './fetchJson.ts';

const json = (body: unknown) => Response.json(body);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchJson', () => {
  it('caches successful requests', async () => {
    const fetchMock = vi.fn(async () => json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchJson('https://example.test/cached');
    await fetchJson('https://example.test/cached');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries failed requests', async () => {
    const url = 'https://example.test/retry';
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchJson(url)).rejects.toThrow(`Failed to get ${url}`);
    await expect(fetchJson(url)).resolves.toEqual({ ok: true });
  });

  it('wraps timeouts', async () => {
    const url = 'https://example.test/timeout';
    const timeout = new DOMException('Timed out', 'TimeoutError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));

    const error = await fetchJson(url).catch((error_: unknown) => error_);

    expect(error).toMatchObject({
      message: `Failed to get ${url}`,
      cause: timeout,
    });
  });

  it('does not modify the init object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({})),
    );
    const init = { timeout: 1000 };

    await fetchJson('https://example.test/init', init);

    expect(init).toEqual({ timeout: 1000 });
  });
});
