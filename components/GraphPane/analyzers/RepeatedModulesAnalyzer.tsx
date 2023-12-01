import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import { Analyzer } from './Analyzer.js';
import styles from './RepeatedModulesAnalyzer.module.scss';

export class RepeatedModulesAnalyzer extends Analyzer {
  versionsByName: Record<string, Module[]> = {};

  map({ module }: GraphModuleInfo) {
    this.versionsByName[module.name] ??= [];
    this.versionsByName[module.name].push(module);
  }

  reduce() {
    const details = Object.entries(this.versionsByName)
      .filter(([, v]) => v.length > 1)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, versions]) => {
        return (
          <div className={styles.row} key={name}>
            <Selectable className={styles.name} type="name" value={name} />

            {versions.map(m => (
              <Selectable
                className={styles.version}
                type="exact"
                label={`${m.version}`}
                key={m.version}
                value={m.key}
              />
            ))}
          </div>
        );
      });

    if (details.length <= 0) return;

    const summary = simplur`Modules with multiple versions (${details.length})`;
    return { summary, details };
  }
}
