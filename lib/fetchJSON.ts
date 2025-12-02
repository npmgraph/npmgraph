import HttpError from './HttpError.js';
import type LoadActivity from './LoadActivity.js';

const requestCache = new Map<string, Promise<unknown>>();

let activity: LoadActivity;
export function setActivityForRequestCache(act: LoadActivity) {
  activity = act;
}

// `fetch()` wrapper that returns parsed JSON and caches requests
export default function fetchJSON<T>(
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
    ? () => {}
    : activity?.start(`Fetching ${decodeURIComponent(url)}`);

  const p = window
    .fetch(input, init)
    .then(res => {
      if (res.ok) return res.json();
      const err = new HttpError(res.status);
      err.stack = traceError.stack;
      return Promise.reject(err);
    })
    .catch(err => {
      err.message = `Failed to get ${url}`;
      return Promise.reject(err);
    })
    .finally(() => finish?.());

  requestCache.set(cacheKey, p);

  return p as Promise<T>;
}
