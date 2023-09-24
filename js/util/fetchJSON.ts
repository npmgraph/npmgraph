import HttpError from './HttpError.js';
import LoadActivity from './LoadActivity.js';

const requestCache = new Map<string, Promise<unknown>>();

let activity: LoadActivity;
export function setActivityForRequestCache(act: LoadActivity) {
  activity = act;
}
export default function fetchJSON<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const url = typeof input === 'string' ? input : input.toString();

  if (requestCache.has(url)) {
    return requestCache.get(url) as Promise<T>;
  }

  const finish = activity?.start(`Fetching ${decodeURIComponent(url)}`);

  const p = window
    .fetch(input, init)
    .then(res =>
      res.ok ? res.json() : Promise.reject(new HttpError(res.status)),
    )
    .finally(() => finish?.());

  requestCache.set(url, p);

  return p as Promise<T>;
}
