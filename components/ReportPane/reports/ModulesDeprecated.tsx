import { cn } from '../../../lib/dom.ts';
import type Module from '../../../lib/Module.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './ModulesDeprecated.module.scss';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

function Row({ module }: { module: Module }) {
  return (
    <div className={cn(styles.root, reportItemStyles.zebraRow)}>
      <Selectable
        value={module.key}
        label={module.label}
        className={styles.selectable}
      />
      {': '}
      <span className={styles.body}>
        &rdquo;{module.package.deprecated}&ldquo;
      </span>
    </div>
  );
}

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
    >
      <p>
        Deprecated modules are unsupported and may have unpatched security
        vulnerabilities. See the deprecation notes below for module-specific
        instructions.
      </p>
      {deprecated
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map(module => (
          <Row key={module.key} module={module} />
        ))}
    </ReportItem>
  );
}
