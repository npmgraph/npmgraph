import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { PARAM_DEPENDENCIES } from '../lib/constants.ts';
import type { DependencyKey } from '../lib/graph-util.ts';

/**
The types of dependencies to include in the graph. The set is stable, so it
can be used in effects.
*/
export default function useDependencyTypes() {
  const [depTypes] = useQueryState(
    PARAM_DEPENDENCIES,
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  return useMemo(() => {
    const extra = depTypes
      .map(s => s.trim())
      .filter(Boolean)
      .toSorted() as DependencyKey[];
    return new Set<DependencyKey>([
      'dependencies',
      'optionalDependencies',
      ...extra,
    ]);
  }, [depTypes]);
}
