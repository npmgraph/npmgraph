import { useEffect, useMemo } from 'react';
import useCollapse from '../../hooks/useCollapse.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { PARAM_PACKAGES } from '../../lib/constants.ts';
import { celebrate } from '../../lib/flash.ts';
import { setGlobalState } from '../../lib/GlobalStore.ts';
import { getGraphForQuery, type GraphState } from '../../lib/graph-util.ts';

// Celebrate when a graph that was just loaded is a single module without dependencies
function celebrateZeroDependencies(
  graph: GraphState,
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  // A collapsed module also results in a graph with a single module
  const firstInfo = graph.moduleInfos.values().next().value;
  if (
    firstInfo &&
    graph.moduleInfos.size === 1 &&
    !firstInfo.module.isStub &&
    isModuleVisible(firstInfo.module)
  ) {
    void celebrate('Zero dependencies for the win!');
  }
}

// Fetch the modules of the query and put the resulting graph in the store.
// The store keeps the previous graph until then, so nothing flashes meanwhile.
async function loadGraph(
  sortedQuery: string[],
  dependencyTypes: ReturnType<typeof useDependencyTypes>,
  isModuleVisible: ({ name }: { name: string }) => boolean,
  signal: AbortSignal,
) {
  const graph = await getGraphForQuery(
    sortedQuery,
    dependencyTypes,
    isModuleVisible,
    signal,
  );

  // Check after async
  if (signal.aborted) {
    return;
  }

  celebrateZeroDependencies(graph, isModuleVisible);
  setGlobalState('graph', graph);
}

// Keep the graph in the store in sync with the query
export default function useLoadGraph(
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  const [query] = useQuery();
  // Pasted package.json files are in the hash, they can change without the query changing
  const [packages] = useHashParam(PARAM_PACKAGES);
  const [collapse] = useCollapse();
  const dependencyTypes = useDependencyTypes();

  // Stable query array for use in effects
  const sortedQuery = useMemo(() => [...query].toSorted(), [query]);

  useEffect(() => {
    const controller = new AbortController();
    void loadGraph(
      sortedQuery,
      dependencyTypes,
      isModuleVisible,
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [sortedQuery, dependencyTypes, collapse, isModuleVisible, packages]);
}
