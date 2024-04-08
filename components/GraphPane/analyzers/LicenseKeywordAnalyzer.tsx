import simplur from 'simplur';
import Module from '../../../lib/Module.js';
import { cn } from '../../../lib/dom.js';
import { LICENSES, OSIKeyword } from '../../../lib/licenses.js';
import { GraphModuleInfo, GraphState } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import styles from './AllModulesAnalyzer.module.scss';
import { Analyzer } from './Analyzer.js';

export class LicenseKeywordAnalyzer extends Analyzer {
  modules: Module[] = [];

  constructor(
    public graph: GraphState,
    public keyword: OSIKeyword,
  ) {
    super(graph);
  }

  map({ module }: GraphModuleInfo) {
    this.modules ??= [];

    if (module.isStub) return;

    const licenses = module.getLicenses();
    if (!licenses?.length) return;
    for (const license of licenses) {
      const keywords = LICENSES[license?.toLowerCase()]?.keywords;
      if (keywords?.includes(this.keyword)) this.modules.push(module);
    }
  }

  reduce() {
    if (!this.modules.length) return;

    const summary = simplur`Modules with "${this.keyword}" license (${this.modules.length})`;

    const details = this.modules
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(module => (
        <div className={cn(styles.row, 'zebra-stripe')} key={module.key}>
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
