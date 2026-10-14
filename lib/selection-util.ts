import { QueryType, type QueryTypeValue } from './ModuleCache.ts';
import { PARAM_SELECTION } from './constants.ts';
import { getHashParameter } from './hash-util.ts';

const selectableQueryTypes = new Set<QueryTypeValue>([
  QueryType.Default,
  QueryType.Name,
  QueryType.Exact,
]);

export function getGraphSelection() {
  const [sel, setSel] = getHashParameter(PARAM_SELECTION);
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

      setSel(
        selectableQueryTypes.has(queryType)
          ? queryValue
          : `${queryType}:${queryValue}`,
      );
    },
  ] as const;
}
