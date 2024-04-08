import simplur from 'simplur';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { AllMaintainersAnalyzer } from './AllMaintainersAnalyzer.js';

export class SoloMaintainersAnalyzer extends AllMaintainersAnalyzer {
  map(moduleInfo: GraphModuleInfo) {
    if (moduleInfo.module.package?.maintainers?.length !== 1) return;

    super.map(moduleInfo);
  }

  reduce() {
    const results = super.reduce();
    if (!results) return;

    // Total # of modules with <= 1 maintainer
    let nModules = 0;
    for (const m of Object.values(this.modulesByMaintainer)) {
      nModules += m.length;
    }

    results.summary = simplur`Modules with only one maintainer (${nModules})`;

    return results;
  }
}
