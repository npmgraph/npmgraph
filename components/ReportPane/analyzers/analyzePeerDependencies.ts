import { satisfies } from 'verkit';
import type Module from '../../../lib/Module.ts';
import type { GraphState } from '../../../lib/graph-util.ts';

export type PeerDependencyInfo = {
  name: string;
  optional: boolean | undefined;
  versionRange: string;
  source: Module;
  destination: Module | undefined;
};

export type PeerDependenciesState = {
  peerDependencyInfos: PeerDependencyInfo[];
};

export function analyzePeerDependencies({
  moduleInfos,
}: GraphState): PeerDependenciesState | undefined {
  const peerDependencyInfos: PeerDependencyInfo[] = [];

  for (const { module } of moduleInfos.values()) {
    const { peerDependencies, peerDependenciesMeta } = module.package;
    if (!peerDependencies) {
      continue;
    }

    for (const [name, versionRange] of Object.entries(peerDependencies)) {
      const pdi: PeerDependencyInfo = {
        name,
        versionRange,
        source: module,
        optional: peerDependenciesMeta?.[name]?.optional,
        destination: undefined,
      };

      // Only count as "met" if the module was brought in via a regular
      // (non-peer) dependency, or is an explicitly queried root module.
      // Nodes that are in the graph solely due to peer dep resolution should
      // still be reported as "missing" in the unmet-peer-deps report.
      const met = moduleInfos
        .values()
        .find(
          ({ module: mod, level, upstream }) =>
            mod.name === name &&
            satisfies(mod.version, versionRange) &&
            (level === 0 ||
              [...upstream].some(({ type }) => type !== 'peerDependencies')),
        );
      if (met) {
        pdi.destination = met.module;
      }

      peerDependencyInfos.push(pdi);
    }
  }

  return { peerDependencyInfos };
}
