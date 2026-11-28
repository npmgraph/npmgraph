import { PARAM_SELECTION } from '../lib/constants.ts';
import { QueryType, type QueryTypeValue } from '../lib/ModuleCache.ts';
import useHashParam from './useHashParam.ts';

const selectableQueryTypes = new Set<QueryTypeValue>([
  QueryType.Default,
  QueryType.Name,
  QueryType.Exact,
]);

const queryTypes = new Set<string>(Object.values(QueryType));

/** Split `type:value`. Values can have colons too, e.g. `pkg@github:user/repo` */
export function parseSelection(selection = '') {
  const [prefix = '', ...rest] = selection.split(':');
  return queryTypes.has(prefix) && rest.length > 0
    ? ([prefix as QueryTypeValue, rest.join(':')] as const)
    : ([QueryType.Default, selection] as const);
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
