import { getModuleKey } from '../../../lib/module-util.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import { type ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import * as styles from './ModulesRepeated.module.scss';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function modulesRepeated({ moduleInfos }: ModuleAnalysisState) {
  const versionsByName: Record<string, string[]> = {};

  for (const { module } of moduleInfos.values()) {
    versionsByName[module.name] ??= [];
    (versionsByName[module.name] ??= []).push(module.version);
  }

  const details = Object.entries(versionsByName)
    .filter(([, v]) => v.length > 1)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([name, versions]) => (
      <div key={name} className={styles.row}>
        <Selectable className={styles.name} value={name} />

        {versions.map(version => (
          <Selectable
            key={version}
            className={styles.version}
            label={version}
            value={getModuleKey(name, version)}
          />
        ))}
      </div>
    ));

  if (details.length === 0) {
    return;
  }

  return {
    type: 'warn',
    summary: 'Modules with multiple versions',
    count: details.length,
    details,
  } as RenderedAnalysis;
}

export function ModulesRepeatedReport() {
  const data = useModuleAnalysis();

  return (
    <ReportItem data={data} reporter={modulesRepeated}>
      Module repetition is a result of incompatible version constraints, and may
      lead to increased bundle and <code>node_modules</code> directory size.
      Consider asking <em>upstream</em> module owners to update to the latest
      version or loosen the version constraint.
    </ReportItem>
  );
}
