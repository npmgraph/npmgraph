import { useMemo } from 'react';
import { PARAM_COLLAPSE } from './constants.ts';
import useHashParam from './useHashParam.ts';

export default function useCollapse() {
  const [value, setValue] = useHashParam(PARAM_COLLAPSE);
  const excludes = useMemo(
    () =>
      (value || '')
        .split(',')
        .filter(Boolean)
        .toSorted()
        .map(v => v.trim()),
    [value],
  );

  return [
    excludes,
    function (newExcludes: string[]) {
      setValue(newExcludes.toSorted().join(','));
    },
  ] as const;
}
