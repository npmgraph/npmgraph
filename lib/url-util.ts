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
