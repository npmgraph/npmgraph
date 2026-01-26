import { useMemo } from 'react';
import { PARAM_COLLAPSE } from './constants.ts';
import useHashParam from './useHashParam.ts';

export default function useCollapse() {
  const [val, setVal] = useHashParam(PARAM_COLLAPSE);
  const excludes = useMemo(
    () =>
      (val || '')
        .split(',')
        .filter(Boolean)
        .sort()
        .map(v => v.trim()),
    [val],
  );

  return [
    excludes,
    function (excludes: string[]) {
      setVal(excludes.sort().join(','));
    },
  ] as const;
}
