import type Module from '../../../lib/Module.js';
import type { GraphState } from '../../GraphDiagram/graph_util.js';

export type ModuleAnalysisState = GraphState & {
  versionsByName: Record<string, Module[]>;
  deprecated: Module[];
};

export function analyzeModules({ moduleInfos, entryModules }: GraphState) {
  const versionsByName: Record<string, Module[]> = {};
  const deprecated: Module[] = [];
  for (const { module } of moduleInfos.values()) {
    // For renderRepeatedModules
    versionsByName[module.name] ??= [];
    versionsByName[module.name].push(module);

    // For renderDeprecatedModules
    if (module.package.deprecated) {
      deprecated.push(module);
    }
  }

  return {
    moduleInfos,
    entryModules,
    versionsByName: {},
    deprecated,
  } as ModuleAnalysisState;
}
