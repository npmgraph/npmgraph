import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import { ModuleRows } from '../ui/Row.tsx';
import { Section } from '../ui/Section.tsx';

export function ModuleDependents({ module }: { module: Module }) {
  const [graph] = useGlobalState('graph');
  const info = graph.moduleInfos.get(module.key);

  const dependents = [
    ...new Map(
      [...(info?.upstream ?? [])].map(({ module }) => [module.key, module]),
    ).values(),
  ].toSorted((a, b) => a.key.localeCompare(b.key));

  if (dependents.length === 0) {
    return null;
  }

  return (
    <Section title="Dependents" count={dependents.length}>
      <ModuleRows modules={dependents} />
    </Section>
  );
}
