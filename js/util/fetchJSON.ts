import { ModulePackage } from '../types.js';
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

export function cachePackage(pkg: ModulePackage) {
  let { name } = pkg;
  const { version } = pkg;
  name = name.replace(/\//g, '%2F');
  const path = version ? `${name}/${version}` : name;
  requestCache.set(path, Promise.resolve(pkg));

  return path;
}

export function loadCacheFromStorage() {
  // Reconstitute [uploaded] modules from sessionStorage
  const { sessionStorage } = window;

  // Pull in user-supplied package.json files that may have been stored in sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    try {
      const cached = sessionStorage.getItem(sessionStorage.key(i) ?? '');
      const module = cached && JSON.parse(cached);
      if (!module?.name) continue;

      cachePackage(module);
    } catch (err) {
      console.error(err);
    }
  }
}
