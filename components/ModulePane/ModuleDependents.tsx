import simplur from 'simplur';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type Module from '../../lib/Module.ts';
import { cn } from '../../lib/dom.ts';
import { Selectable } from '../ui/Selectable.tsx';
import { Section } from '../ui/Section.tsx';
import * as reportItemStyles from '../ReportPane/ReportItem.module.scss';
import * as styles from '../ReportPane/reporters/ModuleList.module.scss';

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
    <Section title={simplur`${dependents.length} Dependent[|s]`}>
      {dependents.map(({ key }) => (
        <div key={key} className={cn(styles.row, reportItemStyles.zebraRow)}>
          <Selectable className={styles.name} value={key} />
        </div>
      ))}
    </Section>
  );
}
