import { useCallback, useMemo, useState } from 'react';
import { PARAM_QUERY, UNNAMED_PACKAGE } from '../lib/constants.ts';
import useSearchParameter from './useSearchParameter.ts';

export function useQuery() {
  const [queryString, setQueryString] = useSearchParameter(PARAM_QUERY);
  const parsedQuery = useMemo(
    () =>
      (queryString ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    [queryString],
  );

  const setQuery = useCallback(
    (moduleKeys: string[] = [], shouldReplace = false) => {
      // Clean up keys
      moduleKeys = moduleKeys.filter(Boolean).map(key => {
        key = key.trim();

        // Don't lowercase URLs
        return /https?:\/\//i.test(key) ? key : key.toLowerCase();
      });
      moduleKeys = [...new Set(moduleKeys)];
      setQueryString(moduleKeys.join(','), shouldReplace);
    },
    [setQueryString],
  );

  return [parsedQuery, setQuery] as const;
}

export function useParsedQuery() {
  const [query] = useQuery();
  const initialValue = query.join(', ');

  return useState(initialValue.startsWith(UNNAMED_PACKAGE) ? '' : initialValue);
}
