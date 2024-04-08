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
    const { entryModules, moduleInfos } = this.graph;
    const summary = simplur`All modules (${entryModules.size} top level,  ${
      moduleInfos.size - entryModules.size
    } dependenc[y|ies])`;

    const details = Array.from(moduleInfos.values())
      .sort((a, b) => a.module.key.localeCompare(b.module.key))
      .map(({ module }) => {
        return (
          <div className={cn(styles.row, 'zebra-row')} key={module.key}>
            <Selectable
              className={cn(styles.name, {
                [styles.entry]: entryModules.has(module),
              })}
              type="exact"
              value={module.key}
            />
          </div>
        );
      });

    return { summary, details };
  }
}
