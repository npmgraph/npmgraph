/* eslint-disable unicorn/no-top-level-side-effects -- meh */
import { setGlobalState, useGlobalState } from '../lib/GlobalStore.ts';
import { syncPackagesHash } from '../lib/ModuleCache.ts';
import { urlPatch } from '../lib/url-util.ts';
import { getActivity } from './useActivity.ts';

function handleLocationUpdate() {
  syncPackagesHash();
  setGlobalState('location', new URL(location.href));
}

globalThis.addEventListener('hashchange', handleLocationUpdate);
globalThis.addEventListener('popstate', handleLocationUpdate);

export function patchLocation(urlParts: Partial<URL>, shouldReplace: boolean) {
  const url = urlPatch(urlParts);
  Object.freeze(url);

  // Nothing is going to change (e.g. querying the same module twice), so make
  // sure there's some feedback
  if (url.href === location.href) {
    getActivity()?.startFor('Loading');
  }

  // Assign url directly to the location field
  if (shouldReplace) {
    history.replaceState({}, '', url);
  } else {
    history.pushState({}, '', url);
  }

  // ... and also update our global cache of the value (notifies listeners)
  setGlobalState('location', url);
}

export default function useLocation() {
  const [href] = useGlobalState('location');

  return [href] as const;
}
