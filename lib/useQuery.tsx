import useSearchParam from './useSearchParam.js';

export const QUERY_PARAM = 'q';

export function useQuery() {
  const [queryString, setQueryString] = useSearchParam(QUERY_PARAM);
  const moduleKeys = queryString.split(/[, ]+/).filter(Boolean);
  return [
    moduleKeys,
    function setQuery(moduleKeys: string[] = [], replace = false) {
      // Clean up keys
      moduleKeys = moduleKeys.filter(Boolean).map(key => {
        key = key.trim();

        // Don't lowercase URLs
        if (/https?:\/\//i.test(key)) return key;

        return key.toLowerCase();
      });
      moduleKeys = [...new Set(moduleKeys)];
      setQueryString(moduleKeys.join(','), replace);
    },
  ] as const;
}
