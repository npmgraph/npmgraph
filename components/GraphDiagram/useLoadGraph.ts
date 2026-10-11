import { useEffect, useMemo } from 'react';
import useCollapse from '../../hooks/useCollapse.ts';
import useDependencyTypes from '../../hooks/useDependencyTypes.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { PaneType, PARAM_PACKAGES } from '../../lib/constants.ts';
import { createAbortable } from '../../lib/createAbortable.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { getGraphForQuery, type GraphState } from '../../lib/graph-util.ts';

// Fetch the modules of the query and store the resulting graph, after calling
// onLoad with it. onLoad must be stable.
export default function useLoadGraph(
  isModuleVisible: ({ name }: { name: string }) => boolean,
  onLoad: (graph: GraphState) => void,
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

        onLoad(newGraph);
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
    onLoad,
    packages,
    setGraph,
    setPane,
  ]);
}
