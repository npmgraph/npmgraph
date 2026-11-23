import {
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_SIZING,
  PARAM_TAB,
} from './constants.ts';

const VIEW_SETTINGS = new Set([
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_SIZING,
  PARAM_TAB,
]);

// The hash parameters without anything that only applies to the current graph (selection, section, collapsed modules…). The tab is kept so that querying doesn't switch it back to the default one
export function getViewSettings(parameters: URLSearchParams) {
  return new URLSearchParams(
    [...parameters].filter(([key]) => VIEW_SETTINGS.has(key)),
  );
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
