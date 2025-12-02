import simplur from 'simplur';
import { QueryType } from '../../../../lib/ModuleCache.js';
import { getModuleKey } from '../../../../lib/module_util.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { ModuleAnalysisState } from '../analyzeModules.js';
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
          <Selectable
            className={styles.name}
            value={name}
          />

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
