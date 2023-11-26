import simplur from 'simplur';
import { Analyzer } from './Analyzer.js';
import { MaintainerMapState, allMaintainers } from './allMaintainers.js';

export const soloMaintainers: Analyzer<MaintainerMapState> = {
  map(graph, moduleInfo, mapState) {
    if (moduleInfo.module?.package?.maintainers?.length > 1) return;
    allMaintainers.map(graph, moduleInfo, mapState);
  },

  reduce(graph, mapState) {
    const results = allMaintainers.reduce(graph, mapState);
    if (!results) return results;

    let nModules = 0;
    for (const m of Object.values(mapState.modulesByMaintainer)) {
      nModules += m.length;
    }

    results.summary = simplur`Modules with only one maintainer (${nModules})`;

    return results;
  },
};
