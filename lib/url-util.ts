import {
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_SIZING,
} from './constants.ts';

const VIEW_SETTINGS = [PARAM_COLORIZE, PARAM_DEPENDENCIES, PARAM_SIZING];

// The hash without anything that only applies to the current graph (selection, section, collapsed modules…)
export function getViewSettingsHash(hash: string) {
  const current = new URLSearchParams(hash.slice(1));
  const parameters = new URLSearchParams();
  for (const key of VIEW_SETTINGS) {
    const value = current.get(key);
    if (value !== null) {
      parameters.set(key, value);
    }
  }

  return parameters.toString();
}

export function urlPatch(urlParts: Partial<URL>, url = new URL(location.href)) {
  Object.assign(url, urlParts);
  return url;
}

export function hashGet(
  key: string,
  url: URL | Location = globalThis.location,
) {
  const parameters = new URLSearchParams(url.hash.slice(1));
  return parameters.get(key);
}

export function hashSet(
  key: string,
  value?: string,
  url: URL | Location = globalThis.location,
) {
  const parameters = new URLSearchParams(url.hash.slice(1));
  if (value) {
    parameters.set(key, value);
  } else {
    parameters.delete(key);
  }

  return parameters.toString();
}

export function searchGet(
  key: string,
  location: URL | Location = globalThis.location,
) {
  const parameters = new URLSearchParams(location.search);
  return parameters.get(key);
}

export function searchSet(
  key: string,
  value?: string,
  location: URL | Location = globalThis.location,
) {
  const parameters = new URLSearchParams(location.search);
  if (value) {
    parameters.set(key, value);
  } else {
    parameters.delete(key);
  }

  return parameters.toString();
}
