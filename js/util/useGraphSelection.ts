import { QueryType } from './ModuleCache.js';
import useHashProp from './useHashProp.js';

export default function useGraphSelection() {
  const [sel, setSel] = useHashProp('sel');
  const i = sel.indexOf(':');
  const type = (i > 0 ? sel.slice(0, i) : '') as QueryType;
  const value = i > 0 ? sel.slice(i + 1) : '';

  return [
    type,
    value,
    function setGraphSelection(queryType?: QueryType, queryValue?: string) {
      if (!queryType || !queryValue) return setSel('');
      setSel(`${queryType}:${queryValue}`);
    },
  ] as const;
}
