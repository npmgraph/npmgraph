import { afterEach, describe, expect, it, vi } from 'vitest';
import { handler } from './npmRegistryProxyWithCors.js';

const event = {
  requestContext: { http: { method: 'GET', path: '/left-pad' } },
  headers: { origin: 'http://localhost:3000' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('npmRegistryProxyWithCors', () => {
  it('does not follow redirects from the registry', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response('', {
          status: 302,
          headers: { location: 'https://example.com/' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler(event);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://registry.npmjs.org/left-pad',
      expect.objectContaining({ redirect: 'manual' }),
    );
    expect(result.statusCode).toBe(302);
    expect(result.headers.location).toBe('https://example.com/');
  });

  it('passes on the status and body of error responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":"Not found"}', { status: 404 })),
    );

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(result.body).toBe('{"error":"Not found"}');
    expect(result.headers['Access-Control-Allow-Origin']).toBe(
      'http://localhost:3000',
    );
  });
});
