import { useEffect, useMemo } from 'react';
import useCollapse from '../../hooks/useCollapse.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { PaneType, PARAM_PACKAGES } from '../../lib/constants.ts';
import { createAbortable } from '../../lib/createAbortable.ts';
import { celebrate } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
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

// Fetch the modules of the query and store the resulting graph
export default function useLoadGraph(
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  const [query] = useQuery();
  // Pasted package.json files are in the hash, they can change without the query changing
  const [packages] = useHashParam(PARAM_PACKAGES);
  const [, setPane] = useGlobalState('pane');
  const [, setGraph] = useGlobalState('graph');
  const [collapse] = useCollapse();
  const dependencyTypes = useDependencyTypes();

  // Stable query array for use in effects
  const sortedQuery = useMemo(() => [...query].toSorted(), [query]);

  useEffect(() => {
    const { signal, abort } = createAbortable();
    void getGraphForQuery(sortedQuery, dependencyTypes, isModuleVisible).then(
      newGraph => {
        // Check after async
        if (signal.aborted) {
          return;
        }

        celebrateZeroDependencies(newGraph, isModuleVisible);
        setGraph(newGraph);

        if (
          newGraph.entryModules.size === 0 &&
          newGraph.failedEntryModules.size > 0
        ) {
          setPane(PaneType.INFO);
        }
      },
    );

    return abort;
  }, [
    sortedQuery,
    dependencyTypes,
    collapse,
    isModuleVisible,
    packages,
    setGraph,
    setPane,
  ]);
}
