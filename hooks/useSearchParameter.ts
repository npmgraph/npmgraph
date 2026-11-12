import { useCallback } from 'react';
import { searchGet, searchSet } from '../lib/url-util.ts';
import useLocation, { patchLocation } from './useLocation.ts';

export default function useSearchParameter(parameterName: string) {
  const [url] = useLocation();

  const setValue = useCallback(
    (value?: string, shouldReplace = true) => {
      patchLocation({ search: searchSet(parameterName, value) }, shouldReplace);
    },
    [parameterName],
  );

  return [searchGet(parameterName, url), setValue] as const;
}
