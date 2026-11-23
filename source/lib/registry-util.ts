import { DEFAULT_NPM_REGISTRY, PARAM_REGISTRY } from './constants.ts';
import { getGlobalState } from './GlobalStore.ts';
import { searchGet } from './url-util.ts';

export function getRegistry() {
  const location = getGlobalState('location');
  return searchGet(PARAM_REGISTRY, location) ?? DEFAULT_NPM_REGISTRY;
}
