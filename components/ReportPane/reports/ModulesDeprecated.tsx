import { Selectable } from '../../ui/Selectable.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './ModuleList.module.css';

export default function ModulesDeprecated() {
  const { deprecated } = useModuleAnalysis();

  if (deprecated.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Deprecated modules"
      count={deprecated.length}
      description="Deprecated modules are unsupported and may have unpatched security vulnerabilities. See the deprecation notes below for module-specific instructions."
    >
      <dl className={styles.list}>
        {deprecated
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map(module => (
            <div key={module.key}>
              <dt>
                <Selectable value={module.key} label={module.label} />
              </dt>
              <dd className={styles.details}>{module.package.deprecated}</dd>
            </div>
          ))}
      </dl>
    </ReportItem>
  );
}
