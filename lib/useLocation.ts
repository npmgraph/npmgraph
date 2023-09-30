import { syncPackagesHash } from './ModuleCache.js';
import sharedStateHook from './sharedStateHook.js';

const [useHref, setHref] = sharedStateHook(new URL(location.href), '');

function handleLocationUpdate() {
  syncPackagesHash();
  setHref(new URL(location.href));
}

window.addEventListener('hashchange', handleLocationUpdate);
window.addEventListener('popstate', handleLocationUpdate);

export default function useLocation() {
  const [href, setHref] = useHref();

  const setLocation = (val: string | URL, replace: boolean) => {
    if (typeof val === 'string') {
      val = new URL(val);
    }

    if (val.href === location.href) return;

    // Dont' allow direct manipulation
    Object.freeze(val);

    // Update state value
    if (replace) {
      window.history.replaceState({}, '', val);
    } else {
      window.history.pushState({}, '', val);
    }
    setHref(val);
  };

  return [href, setLocation] as const;
}
