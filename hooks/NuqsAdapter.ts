import {
  unstable_createAdapterProvider as createAdapterProvider,
  type unstable_UseAdapterHook as UseAdapterHook,
} from 'nuqs/adapters/custom';
import { useMemo } from 'react';
import { PARAM_QUERY, PARAM_REGISTRY } from '../lib/constants.ts';
import useLocation, { patchLocation } from './useLocation.ts';

// These live in the query string, all the others in the hash
const searchKeys = new Set([PARAM_QUERY, PARAM_REGISTRY]);

// nuqs sees both as one set of parameters
function mergeParameters(url: URL | Location) {
  return new URLSearchParams([
    ...new URLSearchParams(url.hash.slice(1)),
    ...new URLSearchParams(url.search),
  ]);
}

const useAdapter: UseAdapterHook = () => {
  const [url] = useLocation();

  return {
    searchParams: useMemo(() => mergeParameters(url), [url]),
    getSearchParamsSnapshot: () => mergeParameters(location),
    updateUrl(parameters, { history }) {
      const search = new URLSearchParams();
      const hash = new URLSearchParams();
      for (const [key, value] of parameters) {
        (searchKeys.has(key) ? search : hash).append(key, value);
      }

      patchLocation(
        { search: search.toString(), hash: hash.toString() },
        history === 'replace',
      );
    },
  };
};

export const NuqsAdapter: ReturnType<typeof createAdapterProvider> =
  createAdapterProvider(useAdapter);
