import { useGlobalState } from './GlobalStore.js';
import { PARAM_QUERY } from './constants.js';
import { searchGet, searchSet } from './url_util.js';
import { patchLocation } from './useLocation.js';

export function useQuery() {
  const [location] = useGlobalState('location');
  const queryString = searchGet(PARAM_QUERY, location) ?? '';
  const moduleKeys = queryString.split(/\s*,\s*/).filter(Boolean);
  return [
    moduleKeys,
    function setQuery(moduleKeys: string[] = [], replace = false) {
      // Clean up keys
      moduleKeys = moduleKeys.filter(Boolean).map((key) => {
        key = key.trim();

        // Don't lowercase URLs
        if (/https?:\/\//i.test(key))
          return key;

        return key.toLowerCase();
      });
      moduleKeys = [...new Set(moduleKeys)];
      const search = searchSet(PARAM_QUERY, moduleKeys.join(','));
      patchLocation({ search }, replace);
    },
  ] as const;
}
