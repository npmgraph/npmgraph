import { useMemo } from 'react';
import { PARAM_COLLAPSE } from '../lib/constants.ts';
import { getHashParameter } from '../lib/hash-util.ts';

export default function useCollapse() {
  const [value, setValue] = getHashParameter(PARAM_COLLAPSE);
  const excludes = useMemo(
    () =>
      (value ?? '')
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
