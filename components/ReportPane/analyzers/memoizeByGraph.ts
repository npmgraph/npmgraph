import type { GraphState } from '../../../lib/graph-util.ts';

/**
Graphs are never mutated once built, so each analysis can be shared by all reports
*/
export function memoizeByGraph<T>(analyze: (graph: GraphState) => T) {
  const cache = new WeakMap<GraphState, T>();
  return (graph: GraphState) => {
    if (!cache.has(graph)) {
      cache.set(graph, analyze(graph));
    }

    return cache.get(graph)!;
  };
}
