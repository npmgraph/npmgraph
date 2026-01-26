import { QueryType } from './ModuleCache.ts';
import { PARAM_SELECTION } from './constants.ts';
import useHashParam from './useHashParam.ts';

export default function useGraphSelection() {
  const [sel, setSel] = useHashParam(PARAM_SELECTION);
  const parts = sel ? sel.split(':') : [];
  const selectType =
    parts.length > 1 ? (parts[0] as QueryType) : QueryType.Default;
  const selectValue = (parts.length > 1 ? parts[1] : parts[0]) ?? '';

  return [
    selectType,
    selectValue,
    function setGraphSelection(
      queryType = QueryType.Default,
      queryValue?: string,
    ) {
      if (!queryType && !queryValue) return setSel('');
      if (
        queryType === QueryType.Default ||
        queryType === QueryType.Name ||
        queryType === QueryType.Exact
      ) {
        setSel(queryValue);
      } else {
        setSel(`${queryType}:${queryValue}`);
      }
    },
  ] as const;
}
