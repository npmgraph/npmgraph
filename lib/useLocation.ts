import { setGlobalState, useGlobalState } from './GlobalStore.ts';
import { syncPackagesHash } from './ModuleCache.ts';
import { urlPatch } from './url_util.ts';

function handleLocationUpdate() {
  syncPackagesHash();
  setGlobalState('location', new URL(globalThis.location.href));
}

globalThis.addEventListener('hashchange', handleLocationUpdate);
globalThis.addEventListener('popstate', handleLocationUpdate);

export function patchLocation(urlParts: Partial<URL>, replace: boolean) {
  const url = urlPatch(urlParts);
  Object.freeze(url);

  // Assign url directly to the location field
  if (replace) {
    globalThis.history.replaceState({}, '', url);
  } else {
    globalThis.history.pushState({}, '', url);
  }

  // ... and also update our global cache of the value (notifies listeners)
  setGlobalState('location', url);
}

export default function useLocation() {
  const [href] = useGlobalState('location');

  return [href] as const;
}
