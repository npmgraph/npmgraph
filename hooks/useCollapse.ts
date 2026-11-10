import { useMemo } from 'react';
import { PARAM_COLLAPSE } from '../lib/constants.ts';
import useHashParameter from './useHashParameter.ts';

export default function useCollapse() {
  const [value, setValue] = useHashParameter(PARAM_COLLAPSE);
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
