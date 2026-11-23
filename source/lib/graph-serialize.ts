import type { GraphState } from './graph-types.ts';

export function serializeGraph({
  moduleInfos,
  entryModules,
  failedEntryModules,
}: GraphState) {
  const nodes: Record<string, { level: number; stub?: true }> = {};
  const edges: string[] = [];

  for (const [key, { module, level, downstream }] of moduleInfos) {
    nodes[key] = module.isStub ? { level, stub: true } : { level };
    for (const { module: to, type } of downstream) {
      edges.push(`${key} -> ${to.key} [${type}]`);
    }
  }

  return {
    entries: [...entryModules].map(m => m.key).toSorted(),
    failed: [...failedEntryModules.keys()].toSorted(),
    nodes,
    edges: edges.toSorted(),
  };
}
