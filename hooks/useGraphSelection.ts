import { QueryType, type QueryTypeValue } from '../lib/ModuleCache.ts';
import { PARAM_SELECTION } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

const selectableQueryTypes = new Set<QueryTypeValue>([
  QueryType.Default,
  QueryType.Name,
  QueryType.Exact,
]);

export function parseSelection(selection: string | null) {
  const parts = selection ? selection.split(':') : [];
  const type =
    parts.length > 1 ? (parts[0] as QueryTypeValue) : QueryType.Default;
  const value = (parts.length > 1 ? parts[1] : parts[0]) ?? '';
  return [type, value] as const;
}

export default function useGraphSelection() {
  const [sel, setSel] = useHashParam(PARAM_SELECTION);
  const [selectType, selectValue] = parseSelection(sel);

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
