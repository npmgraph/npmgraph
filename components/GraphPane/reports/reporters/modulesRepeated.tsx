import simplur from 'simplur';
import { getModuleKey } from '../../../../lib/module_util.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { ModuleAnalysisState } from '../analyzeModules.ts';
import * as styles from './modulesRepeated.module.scss';

export function modulesRepeated({ moduleInfos }: ModuleAnalysisState) {
  const versionsByName: Record<string, string[]> = {};

  moduleInfos.forEach(({ module }) => {
    versionsByName[module.name] ??= [];
    versionsByName[module.name].push(module.version);
  });

  const details = Object.entries(versionsByName)
    .filter(([, v]) => v.length > 1)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, versions]) => {
      return (
        <div className={styles.row} key={name}>
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
      );
    });

  if (details.length <= 0) return;

  const summary = simplur`Modules with multiple versions (${details.length})`;

  return { type: 'warn', summary, details } as RenderedAnalysis;
}
