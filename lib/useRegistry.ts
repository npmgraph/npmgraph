import { DEFAULT_NPM_REGISTRY, PARAM_REGISTRY } from './constants.js';
import { getGlobalState } from './GlobalStore.js';
import { searchGet, searchSet } from './url_util.js';
import useLocation, { patchLocation } from './useLocation.js';

export default function useRegistry() {
  const [location] = useLocation();
  const registry = searchGet(PARAM_REGISTRY, location);

  return [registry, setRegistry] as const;
}

function setRegistry(registry: string) {
  const search = searchSet(
    PARAM_REGISTRY,
    registry === DEFAULT_NPM_REGISTRY ? '' : registry,
  );
  patchLocation({ search }, true);
}

export function getRegistry() {
  const location = getGlobalState('location');
  return searchGet(PARAM_REGISTRY, location) ?? DEFAULT_NPM_REGISTRY;
}
