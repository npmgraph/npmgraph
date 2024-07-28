export function urlPatch(urlParts: Partial<URL>, url = new URL(location.href)) {
  Object.assign(url, urlParts);
  return url;
}

export function hashGet(
  key: string,
  location: URL | Location = window.location,
) {
  const params = new URLSearchParams(location.hash.slice(1));
  return params.get(key);
}

export function hashSet(
  key: string,
  value?: string,
  location: URL | Location = window.location,
) {
  const params = new URLSearchParams(location.hash.slice(1));
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  return params.toString();
}

export function searchGet(
  key: string,
  location: URL | Location = window.location,
) {
  const params = new URLSearchParams(location.search);
  return params.get(key);
}

export function searchSet(
  key: string,
  value?: string,
  location: URL | Location = window.location,
) {
  const params = new URLSearchParams(location.search);
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  return params.toString();
}
