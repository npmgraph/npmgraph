import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { cn } from '../../../lib/dom.js';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import styles from './AllModulesAnalyzer.module.scss';
import { Analyzer } from './Analyzer.js';

export class AllModulesAnalyzer extends Analyzer {
  entryModules = new Set<Module>();
  moduleInfos = new Map<string, GraphModuleInfo>();

  map() {}

  reduce() {
    const summary = simplur`All modules (${
      this.graph.entryModules.size
    } top level,  ${
      this.moduleInfos.size - this.entryModules.size
    } dependent[|s])`;

    const details = Array.from(this.moduleInfos.values())
      .sort((a, b) => a.module.key.localeCompare(b.module.key))
      .map(({ module }) => (
        <div className={cn(styles.row)} key={module.key}>
          <Selectable
            className={cn(styles.name, {
              [styles.entry]: this.entryModules.has(module),
            })}
            type="exact"
            value={module.key}
          />
        </div>
      ));

    return { summary, details };
  }
}
