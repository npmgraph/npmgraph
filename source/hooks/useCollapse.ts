import { useMemo } from 'react';
import { parseCommaList } from '../lib/array-util.ts';
import { PARAM_COLLAPSE } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

export default function useCollapse() {
  const [value, setValue] = useHashParam(PARAM_COLLAPSE);
  const excludes = useMemo(() => parseCommaList(value).toSorted(), [value]);

  return [
    excludes,
    function (newExcludes: string[]) {
      setValue(newExcludes.toSorted().join(','));
    },
  ] as const;
}
