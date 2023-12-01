import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { cn } from '../../../lib/dom.js';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import styles from './AllModulesAnalyzer.module.scss';
import { Analyzer } from './Analyzer.js';

export class MissingLicensesAnalyzer extends Analyzer {
  modules: Module[] = [];

  map({ module }: GraphModuleInfo) {
    if (module.isStub) return;
    const licenses = module.getLicenses();

    if (!licenses.length || licenses[0] === 'unlicensed')
      this.modules.push(module);
  }

  reduce() {
    if (!this.modules.length) return;

    const summary = simplur`Unlicensed modules (${this.modules.length})`;

    const details = this.modules
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(module => (
        <div className={cn(styles.row)} key={module.key}>
          <Selectable
            className={cn(styles.name)}
            type="exact"
            value={module.key}
          />
        </div>
      ));

    return { summary, details };
  }
}
