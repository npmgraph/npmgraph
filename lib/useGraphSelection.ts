import type { QueryType } from './ModuleCache.js';
import { PARAM_SELECTION } from './constants.js';
import useHashParam from './useHashParam.js';

export default function useGraphSelection() {
  const [sel, setSel] = useHashParam(PARAM_SELECTION);
  const i = (sel ?? '').indexOf(':');
  const selectType = (sel && i > 0 ? sel?.slice(0, i) : '') as QueryType;
  const selectValue = sel && i > 0 ? sel?.slice(i + 1) : '';

  return [
    selectType,
    selectValue,
    function setGraphSelection(queryType?: QueryType, queryValue?: string) {
      if (!queryType || !queryValue)
        return setSel('');
      setSel(`${queryType}:${queryValue}`);
    },
  ] as const;
}
