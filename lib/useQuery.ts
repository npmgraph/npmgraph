import { useMemo, useState } from 'react';
import { useGlobalState } from './GlobalStore.ts';
import { PARAM_QUERY, UNNAMED_PACKAGE } from './constants.ts';
import { searchGet, searchSet } from './url_util.ts';
import { patchLocation } from './useLocation.ts';

function setQuery(moduleKeys: string[] = [], replace = false) {
  // Clean up keys
  moduleKeys = moduleKeys.filter(Boolean).map(key => {
    key = key.trim();

    // Don't lowercase URLs
    if (/https?:\/\//iv.test(key)) return key;

    return key.toLowerCase();
  });
  moduleKeys = [...new Set(moduleKeys)];
  const search = searchSet(PARAM_QUERY, moduleKeys.join(','));
  patchLocation({ search }, replace);
}

export function useQuery() {
  const [location] = useGlobalState('location');
  const queryString = searchGet(PARAM_QUERY, location) ?? '';
  const parsedQuery = useMemo(
    () => queryString.split(/\s*,\s*/v).filter(Boolean),
    [queryString],
  );
  return [parsedQuery, setQuery] as const;
}

export function useParsedQuery() {
  const [query] = useQuery();
  const initialValue = query.join(', ');

  return useState(initialValue.startsWith(UNNAMED_PACKAGE) ? '' : initialValue);
}
