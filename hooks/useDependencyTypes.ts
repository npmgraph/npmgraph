import { useMemo } from 'react';
import { parseCommaList } from '../lib/array-util.ts';
import { PARAM_DEPENDENCIES } from '../lib/constants.ts';
import type { DependencyKey } from '../lib/graph-util.ts';
import useHashParam from './useHashParam.ts';

/**
The types of dependencies to include in the graph. The set is stable, so it
can be used in effects.
*/
export default function useDependencyTypes() {
  const [depTypes] = useHashParam(PARAM_DEPENDENCIES);

  return useMemo(() => {
    const extra = parseCommaList(depTypes).toSorted() as DependencyKey[];
    return new Set<DependencyKey>([
      'dependencies',
      'optionalDependencies',
      ...extra,
    ]);
  }, [depTypes]);
}
