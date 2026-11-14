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
  // Keyed by module key, since the same module can be loaded as more than one instance
  const reach = (skip?: string) => {
    const seen = new Set<string>();
    const stack = [...entryModules].map(({ key }) => key);
    for (let key = stack.pop(); key; key = stack.pop()) {
      if (key === skip || seen.has(key)) {
        continue;
      }

      seen.add(key);
      for (const { module } of moduleInfos.get(key)?.downstream ?? []) {
        stack.push(module.key);
      }
    }

    return seen;
  };

  const entryKeys = new Set([...entryModules].map(({ key }) => key));
  const direct = new Map<string, Module>();
  for (const entry of entryModules) {
    for (const { module } of moduleInfos.get(entry.key)?.downstream ?? []) {
      if (!entryKeys.has(module.key)) {
        direct.set(module.key, module);
      }
    }
  }

  const all = reach();
  return [...direct.values()]
    .map(module => ({
      module,
      dropped: all.size - reach(module.key).size,
    }))
    .filter(({ dropped }) => dropped > 1)
    .toSorted(
      (a, b) =>
        b.dropped - a.dropped || a.module.name.localeCompare(b.module.name),
    ) satisfies RemovalImpact[];
}
