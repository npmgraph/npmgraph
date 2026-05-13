import HttpError from './HttpError.ts';
import type LoadActivity from './LoadActivity.ts';

const requestCache = new Map<string, Promise<unknown>>();

let activity: LoadActivity;
export function setActivityForRequestCache(act: LoadActivity) {
  activity = act;
}

// `fetch()` wrapper that returns parsed JSON and caches requests
export default async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit & { silent?: boolean; timeout?: number },
): Promise<T> {
  const url = typeof input === 'string' ? input : input.toString();
  const cacheKey = `${url} ${JSON.stringify(init)}`;

  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey) as Promise<T>;
  }

  init ??= {};

  if (init.timeout) {
    if (init.signal) throw new Error('Cannot use timeout with signal');
    // Abort request after `timeout`, while also respecting user-supplied `signal`
    init.signal = AbortSignal?.timeout(init.timeout);
  }

  // eslint-disable-next-line unicorn/error-message
  const traceError = new Error();

  const finish = init.silent
    ? undefined
    : activity?.start(`Fetching ${decodeURIComponent(url)}`);

  const p: Promise<T> = globalThis
    .fetch(input, init)
    .then(async response => {
      if (response.ok) return (await response.json()) as T;
      const error = new HttpError(response.status);
      error.stack = traceError.stack;
      throw error;
    })
    .catch((error: unknown) => {
      const wrappedError =
        error instanceof Error ? error : new Error(String(error));
      wrappedError.message = `Failed to get ${url}`;
      throw wrappedError;
    })
    .finally(() => {
      finish?.();
    });

  requestCache.set(cacheKey, p);

  return p;
}
