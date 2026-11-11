import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { PARAM_COLLAPSE } from '../lib/constants.ts';

export default function useCollapse() {
  const [value, setValue] = useQueryState(
    PARAM_COLLAPSE,
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const excludes = useMemo(
    () =>
      value
        .filter(Boolean)
        .toSorted()
        .map(v => v.trim()),
    [value],
  );

  return [
    excludes,
    function (newExcludes: string[]) {
      void setValue(newExcludes.toSorted());
    },
  ] as const;
}
