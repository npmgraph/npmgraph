import { QueryType, type QueryTypeValue } from '../lib/ModuleCache.ts';
import { PARAM_SELECTION } from '../lib/constants.ts';
import useHashParam from './useHashParam.ts';

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

      if (
        // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons -- Bad .includes typing
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
