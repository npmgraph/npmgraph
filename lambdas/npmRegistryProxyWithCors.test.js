import { afterEach, describe, expect, it, vi } from 'vitest';
import { handler } from './npmRegistryProxyWithCors.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('npm registry proxy', () => {
  it('does not follow redirects from the registry', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { location: 'https://example.com/redirected' },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    const result = await handler({
      headers: { origin: 'https://npmgraph.js.org' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/some-package',
        },
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://registry.npmjs.org/some-package',
      expect.objectContaining({ redirect: 'manual' }),
    );
    expect(result.statusCode).toBe(302);
    expect(result.headers.location).toBe('https://example.com/redirected');
  });
});
