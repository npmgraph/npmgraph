import { useMemo } from 'react';
import { PARAM_COLLAPSE } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

export default function useCollapse() {
  const [value, setValue] = useHashParam(PARAM_COLLAPSE);
  const collapsed = useMemo(
    () =>
      new Set(
        (value ?? '')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean),
      ),
    [value],
  );

  function setCollapsed(names: Iterable<string>) {
    setValue([...names].toSorted().join(','));
  }

  function toggle(name: string) {
    const next = new Set(collapsed);
    if (!next.delete(name)) {
      next.add(name);
    }

    setCollapsed(next);
  }

  return [collapsed, setCollapsed, toggle] as const;
}
