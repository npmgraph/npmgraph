import HttpError from './HttpError.ts';
import type LoadActivity from './LoadActivity.ts';

const requestCache = new Map<string, Promise<unknown>>();

let activity: LoadActivity;
export function setActivityForRequestCache(act: LoadActivity) {
  activity = act;
}

// `fetch()` wrapper that returns parsed JSON and caches requests
export default async function fetchJson<T>(
  input: URL | string,
  init?: RequestInit & { silent?: boolean; timeout?: number },
): Promise<T> {
  const url = String(input);
  const cacheKey = `${url} ${JSON.stringify(init)}`;

  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey) as Promise<T>;
  }

  init = { ...init };

  if (init.timeout) {
    if (init.signal) {
      throw new Error('Cannot use timeout with signal');
    }

    // Abort request after `timeout`, while also respecting user-supplied `signal`
    init.signal = AbortSignal?.timeout(init.timeout);
  }

  // eslint-disable-next-line unicorn/error-message
  const traceError = new Error();

  const finish = init.silent
    ? () => {}
    : activity?.start(`Fetching ${decodeURIComponent(url)}`);

  const p = fetch(input, init)
    .then(async response => {
      if (response.ok) {
        return response.json() as unknown;
      }

      const error = new HttpError(response.status);
      error.stack = traceError.stack;
      throw error;
    })
    .catch(error => {
      // Don't cache failures, so they can be retried
      requestCache.delete(cacheKey);

      const message = `Failed to get ${url}`;

      // `message` is read-only on DOMExceptions (e.g. timeouts and aborts)
      if (!(error instanceof DOMException)) {
        error.message = message;
        throw error;
      }

      throw new Error(message, { cause: error });
    })
    .finally(() => {
      finish?.();
    });

  requestCache.set(cacheKey, p);

  return p as Promise<T>;
}
