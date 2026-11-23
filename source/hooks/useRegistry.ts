import { useCallback } from 'react';
import { DEFAULT_NPM_REGISTRY, PARAM_REGISTRY } from '../lib/constants.ts';
import useSearchParameter from './useSearchParameter.ts';

export default function useRegistry() {
  const [registry, setParameter] = useSearchParameter(PARAM_REGISTRY);
  const setRegistry = useCallback(
    (value: string) => {
      setParameter(value === DEFAULT_NPM_REGISTRY ? '' : value);
    },
    [setParameter],
  );

  return [registry, setRegistry] as const;
}
