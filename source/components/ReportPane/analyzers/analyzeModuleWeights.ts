import type { GraphState } from '../../../lib/graph-util.ts';

// Share of the graph a module has to pull in to be considered heavy
const HEAVY_SHARE = 0.25;

export type ModuleWeight = {
  // Modules that come along with this one, itself excluded
  pulls: number;
  heavy: boolean;
};

export function analyzeModuleWeights({
  moduleInfos,
  entryModules,
}: Pick<GraphState, 'moduleInfos' | 'entryModules'>) {
  const entryKeys = new Set([...entryModules].map(({ key }) => key));
  const weights = new Map<string, ModuleWeight>();
  for (const key of moduleInfos.keys()) {
    // Entry modules pull in the whole graph by definition
    if (entryKeys.has(key)) {
      continue;
    }

    // Keyed by module key, since the same module can be loaded as more than one instance
    const seen = new Set([key]);
    const stack = [key];
    for (let next = stack.pop(); next; next = stack.pop()) {
      for (const { module } of moduleInfos.get(next)?.downstream ?? []) {
        if (seen.has(module.key)) {
          continue;
        }

        seen.add(module.key);
        stack.push(module.key);
      }
    }

    const pulls = seen.size - 1;
    if (pulls === 0) {
      continue;
    }

    weights.set(key, {
      pulls,
      heavy: pulls >= moduleInfos.size * HEAVY_SHARE,
    });
  }

  return weights;
}
