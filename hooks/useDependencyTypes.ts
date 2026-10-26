import { useMemo } from 'react';
import { PARAM_DEPENDENCIES } from '../lib/constants.ts';
import type { DependencyKey } from '../lib/graph-util.ts';
import useHashParam from './useHashParam.ts';

export function parseDependencyTypes(value: string | null) {
  const extra = (value ?? '')
    .split(/\s*,\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .toSorted() as DependencyKey[];
  return new Set<DependencyKey>([
    'dependencies',
    'optionalDependencies',
    ...extra,
  ]);
}

/**
The types of dependencies to include in the graph. The set is stable, so it
can be used in effects.
*/
export default function useDependencyTypes() {
  const [depTypes] = useHashParam(PARAM_DEPENDENCIES);

  return useMemo(() => parseDependencyTypes(depTypes), [depTypes]);
}
