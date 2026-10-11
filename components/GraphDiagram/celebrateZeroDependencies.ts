import { celebrate } from '../../lib/flash.ts';
import type { GraphState } from '../../lib/graph-util.ts';

// Celebrate when a graph that was just loaded is a single module without dependencies
export default function celebrateZeroDependencies(
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
