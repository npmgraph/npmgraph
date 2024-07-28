import { setGlobalState, useGlobalState } from './GlobalStore.js';
import { syncPackagesHash } from './ModuleCache.js';
import { urlPatch } from './url_util.js';

function handleLocationUpdate() {
  syncPackagesHash();
  setGlobalState('location', new URL(location.href));
}

window.addEventListener('hashchange', handleLocationUpdate);
window.addEventListener('popstate', handleLocationUpdate);

export function patchLocation(urlParts: Partial<URL>, replace: boolean) {
  const url = urlPatch(urlParts);
  Object.freeze(url);

  // Assign url directly to the location field
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }

  // ... and also update our global cache of the value (notifies listeners)
  setGlobalState('location', url);
}

export default function useLocation() {
  const [href] = useGlobalState('location');

  return [href] as const;
}
