import { QueryType, type QueryTypeValue } from '../lib/ModuleCache.ts';
import { PARAM_SELECTION } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

const selectableQueryTypes = new Set<QueryTypeValue>([
  QueryType.Default,
  QueryType.Name,
  QueryType.Exact,
]);

export default function useGraphSelection() {
  const [sel, setSel] = useHashParam(PARAM_SELECTION);
  const parts = sel ? sel.split(':') : [];
  const selectType =
    parts.length > 1 ? (parts[0] as QueryTypeValue) : QueryType.Default;
  const selectValue = (parts.length > 1 ? parts[1] : parts[0]) ?? '';

  return [
    selectType,
    selectValue,
    (queryType: QueryTypeValue = QueryType.Default, queryValue?: string) => {
      if (!queryType && !queryValue) {
        setSel('');
        return;
      }

      if (selectableQueryTypes.has(queryType)) {
        setSel(queryValue);
      } else {
        setSel(`${queryType}:${queryValue}`);
      }
    },
  ] as const;
}
