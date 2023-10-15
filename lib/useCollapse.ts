import { useMemo } from 'react';
import { PARAM_COLLAPSE } from './constants.js';
import useHashParam from './useHashParam.js';

export default function useCollapse() {
  const [val, setVal] = useHashParam(PARAM_COLLAPSE);
  const excludes = useMemo(
    () =>
      val
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
