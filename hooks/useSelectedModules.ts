import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import useGraphSelection from './useGraphSelection.ts';

export function useSelectedModules() {
  const [graph] = useGlobalState('graph');
  const [queryType, queryValue] = useGraphSelection();

  const selectedModules = queryModuleCache(queryType, queryValue);

  // Fall back to the top-level module if nothing is selected
  const [entryModule] = graph.entryModules;
  if (
    entryModule &&
    graph.entryModules.size === 1 &&
    selectedModules.size === 0
  ) {
    return new Map([[entryModule.key, entryModule]]);
  }

  return selectedModules;
}
