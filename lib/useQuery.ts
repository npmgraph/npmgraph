import { useMemo, useState } from 'react';
import { useGlobalState } from './GlobalStore.ts';
import { PARAM_QUERY, UNNAMED_PACKAGE } from './constants.ts';
import { searchGet, searchSet } from './url_util.ts';
import { patchLocation } from './useLocation.ts';

function setQuery(moduleKeys: string[] = [], shouldReplace = false) {
  // Clean up keys
  moduleKeys = moduleKeys.filter(Boolean).map(key => {
    key = key.trim();

    // Don't lowercase URLs
    return /https?:\/\//i.test(key) ? key : key.toLowerCase();
  });
  moduleKeys = [...new Set(moduleKeys)];
  const search = searchSet(PARAM_QUERY, moduleKeys.join(','));
  patchLocation({ search }, shouldReplace);
}

export function useQuery() {
  const [location] = useGlobalState('location');
  const queryString = searchGet(PARAM_QUERY, location) ?? '';
  const parsedQuery = useMemo(
    () => queryString.split(/\s*,\s*/).filter(Boolean),
    [queryString],
  );
  return [parsedQuery, setQuery] as const;
}

export function useParsedQuery() {
  const [query] = useQuery();
  const initialValue = query.join(', ');

  // eslint-disable-next-line @eslint-react/use-state -- https://github.com/Rel1cx/eslint-react/issues/1963
  return useState(initialValue.startsWith(UNNAMED_PACKAGE) ? '' : initialValue);
}
