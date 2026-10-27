import { useMemo } from 'react';
import { PARAM_COLLAPSE, PARAM_ONLY } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

export default function useCollapse() {
  const [value, setValue] = useHashParam(PARAM_COLLAPSE);
  const [only] = useHashParam(PARAM_ONLY);
  // The report-only view ignores collapsed modules
  const ignored = only === 'report';
  const excludes = useMemo(
    () =>
      (ignored ? '' : (value ?? ''))
        .split(',')
        .filter(Boolean)
        .toSorted()
        .map(v => v.trim()),
    [value, ignored],
  );

  return [
    excludes,
    function (newExcludes: string[]) {
      setValue(newExcludes.toSorted().join(','));
    },
  ] as const;
}
