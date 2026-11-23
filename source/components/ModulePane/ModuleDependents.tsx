import { useGlobalState } from '../../lib/GlobalStore.ts';
import type { GraphState } from '../../lib/graph-util.ts';
import type Module from '../../lib/Module.ts';
import { ModuleRows } from '../ui/Row.tsx';
import { Section } from '../ui/Section.tsx';

// Collect all dependents recursively (`seen` also stops cycles)
function collectDependents(
  graph: GraphState,
  key: string,
  seen: Map<string, Module>,
) {
  for (const { module } of graph.moduleInfos.get(key)?.upstream ?? []) {
    if (seen.has(module.key)) {
      continue;
    }

    seen.set(module.key, module);
    collectDependents(graph, module.key, seen);
  }
}

export function ModuleDependents({ module }: { module: Module }) {
  const [graph] = useGlobalState('graph');
  const seen = new Map<string, Module>();
  collectDependents(graph, module.key, seen);
  seen.delete(module.key);

  const dependents = [...seen.values()].toSorted((a, b) =>
    a.key.localeCompare(b.key),
  );

  if (dependents.length === 0) {
    return null;
  }

  return (
    <Section title="Dependents" count={dependents.length}>
      <ModuleRows modules={dependents} />
    </Section>
  );
}
