import type Module from '../../../lib/Module.ts';
import type { GraphState } from '../../../lib/graph-util.ts';
import {
  getVersionStatus,
  type VersionStatus,
} from '../../../lib/version-status.ts';

export type OutdatedModule = {
  module: Module;
  status: Extract<VersionStatus, { type: 'outdated' }>;
};

export type ModuleAnalysisState = GraphState & {
  versionsByName: Record<string, Module[]>;
  deprecated: Module[];
  outdated: OutdatedModule[];
};

export function analyzeModules({ moduleInfos, entryModules }: GraphState) {
  const versionsByName: Record<string, Module[]> = {};
  const deprecated: Module[] = [];
  const outdated: OutdatedModule[] = [];
  for (const { module } of moduleInfos.values()) {
    // For renderRepeatedModules
    versionsByName[module.name] ??= [];
    (versionsByName[module.name] ??= []).push(module);

    // For renderDeprecatedModules
    if (module.package.deprecated) {
      deprecated.push(module);
    }

    // For modulesOutdated (the packument is already loaded with each module)
    if (!module.packument || module.isLocal || module.isStub) {
      continue;
    }

    const status = getVersionStatus(
      module.version,
      module.packument['dist-tags'],
    );
    if (status?.type === 'outdated') {
      outdated.push({ module, status });
    }
  }

  return {
    moduleInfos,
    entryModules,
    versionsByName: {},
    deprecated,
    outdated,
  } as ModuleAnalysisState;
}
