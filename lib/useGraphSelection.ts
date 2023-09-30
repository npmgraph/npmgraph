import { QueryType } from './ModuleCache.js';
import { SELECTION_PARAM } from './constants.js';
import useHashParam from './useHashParam.js';

export default function useGraphSelection() {
  const [sel, setSel] = useHashParam(SELECTION_PARAM);
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
