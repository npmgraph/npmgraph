import { cn } from '../../../lib/dom.ts';
import type Module from '../../../lib/Module.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './modulesAll.module.scss';

export function ModuleList({
  modules,
  entryModules,
}: {
  modules: Module[];
  entryModules: Set<Module>;
}) {
  return modules.map(module => (
    <div key={module.key} className={cn(styles.row, reportItemStyles.zebraRow)}>
      <Selectable
        className={cn(styles.name, {
          [styles.entry]: entryModules.has(module),
        })}
        value={module.key}
      />
    </div>
  ));
}
