import { useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { DEFAULT_NPM_REGISTRY, PARAM_REGISTRY } from '../lib/constants.ts';

export default function useRegistry() {
  const [registry, setParameter] = useQueryState(PARAM_REGISTRY);
  const setRegistry = useCallback(
    (value: string) => {
      void setParameter(value === DEFAULT_NPM_REGISTRY ? null : value || null);
    },
    [setParameter],
  );

  return [registry, setRegistry] as const;
}
