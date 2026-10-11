import { useEffect, useRef } from 'react';
import { celebrate } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';

// Celebrate when a graph that was just loaded is a single module without dependencies
export default function useCelebrateZeroDependencies(
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  const [graph] = useGlobalState('graph');

  // Only celebrate graphs that are loaded after this is mounted, once each
  const lastGraphRef = useRef(graph);

  useEffect(() => {
    if (graph === lastGraphRef.current) {
      return;
    }

    lastGraphRef.current = graph;

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
  }, [graph, isModuleVisible]);
}
