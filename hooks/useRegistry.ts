import { DEFAULT_NPM_REGISTRY, PARAM_REGISTRY } from '../lib/constants.ts';
import { searchGet, searchSet } from '../lib/url-util.ts';
import useLocation, { patchLocation } from './useLocation.ts';

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
