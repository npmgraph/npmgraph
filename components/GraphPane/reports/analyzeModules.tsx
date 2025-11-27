import type Module from '../../../lib/Module.js';
import type { GraphState } from '../../GraphDiagram/graph_util.js';

export type ModuleWithAge = {
  module: Module;
  publishDate: number | null;
};

export type ModuleAnalysisState = GraphState & {
  versionsByName: Record<string, Module[]>;
  deprecated: Module[];
};

export type ModuleAgeAnalysisState = GraphState & {
  modulesWithAge: ModuleWithAge[];
};

export function analyzeModules({ moduleInfos, entryModules }: GraphState) {
  const versionsByName: Record<string, Module[]> = {};
  const deprecated: Module[] = [];
  const modulesWithAge: ModuleWithAge[] = [];

  for (const { module } of moduleInfos.values()) {
    // For renderRepeatedModules
    versionsByName[module.name] ??= [];
    versionsByName[module.name].push(module);

    // For renderDeprecatedModules
    if (module.package.deprecated) {
      deprecated.push(module);
    }

    // For modulesAge reporter
    let publishDate: number | null = null;
    if (module.packument?.time && module.version) {
      const timeStr = module.packument.time[module.version];
      if (timeStr) {
        publishDate = Date.parse(timeStr);
      }
    }
    modulesWithAge.push({ module, publishDate });
  }

  return {
    moduleInfos,
    entryModules,
    versionsByName: {},
    deprecated,
    modulesWithAge,
  } as ModuleAnalysisState & ModuleAgeAnalysisState;
}
