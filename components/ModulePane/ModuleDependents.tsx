import simplur from 'simplur';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import { QueryLink } from '../ui/QueryLink.tsx';
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
    <Section title={simplur`Dependent[|s]`} count={dependents.length}>
      <ul style={{ margin: 0, paddingInlineStart: '1.2em' }}>
        {dependents.map(({ key }) => (
          <li key={key}>
            <QueryLink query={key} reset={false}>
              {key}
            </QueryLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
