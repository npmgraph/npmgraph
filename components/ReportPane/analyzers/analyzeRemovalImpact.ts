import type Module from '../../../lib/Module.ts';
import type { GraphState } from '../../../lib/graph-util.ts';

export type RemovalImpact = {
  module: Module;
  // Modules that would disappear from the graph, including the module itself
  dropped: number;
};

export function analyzeRemovalImpact({
  moduleInfos,
  entryModules,
}: Pick<GraphState, 'moduleInfos' | 'entryModules'>) {
  const reach = (skip?: Module) => {
    const seen = new Set<Module>();
    const stack = [...entryModules];
    for (let module = stack.pop(); module; module = stack.pop()) {
      if (module === skip || seen.has(module)) {
        continue;
      }

      seen.add(module);
      for (const { module: dep } of moduleInfos.get(module.key)?.downstream ??
        []) {
        stack.push(dep);
      }
    }

    return seen;
  };

  const direct = new Set<Module>();
  for (const entry of entryModules) {
    for (const { module } of moduleInfos.get(entry.key)?.downstream ?? []) {
      if (!entryModules.has(module)) {
        direct.add(module);
      }
    }
  }

  const all = reach();
  return [...direct]
    .map(module => ({
      module,
      dropped: all.size - reach(module).size,
    }))
    .filter(({ dropped }) => dropped > 1)
    .toSorted(
      (a, b) =>
        b.dropped - a.dropped || a.module.name.localeCompare(b.module.name),
    ) satisfies RemovalImpact[];
}
