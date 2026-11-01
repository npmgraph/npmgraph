import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import { type ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './ModulesDeprecated.module.scss';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function modulesDeprecated({ deprecated }: ModuleAnalysisState) {
  if (deprecated.length === 0) {
    return;
  }

  const details = deprecated
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map(module => (
      <div
        key={module.key}
        className={cn(styles.root, reportItemStyles.zebraRow)}
      >
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
    ));

  return {
    type: 'warn',
    summary: 'Deprecated modules',
    count: deprecated.length,
    details,
  } as RenderedAnalysis;
}

export function ModulesDeprecatedReport() {
  const data = useModuleAnalysis();

  return (
    <ReportItem data={data} reporter={modulesDeprecated}>
      Deprecated modules are unsupported and may have unpatched security
      vulnerabilities. See the deprecation notes below for module-specific
      instructions.
    </ReportItem>
  );
}
