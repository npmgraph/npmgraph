import { satisfies } from 'verkit';
import type Module from '../../../lib/Module.ts';
import type { GraphModuleInfo, GraphState } from '../../../lib/graph-util.ts';

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

function hasNonPeerUpstream(upstream: GraphModuleInfo['upstream']) {
  return [...upstream].some(({ type }) => type !== 'peerDependencies');
}

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
      // Only count as "met" if the module was brought in via a regular
      // (non-peer) dependency, or is an explicitly queried root module.
      // Nodes that are in the graph solely due to peer dep resolution should
      // still be reported as "missing" in the unmet-peer-deps report.
      const destination = moduleInfos.values().find(
        ({ module: candidate, level, upstream }) =>
          // Same package
          candidate.name === name &&
          // Version is compatible with the requested range
          satisfies(candidate.version, versionRange) &&
          // Explicitly queried root module, or not only a peer dependency
          (level === 0 || hasNonPeerUpstream(upstream)),
      )?.module;

      const pdi: PeerDependencyInfo = {
        name,
        versionRange,
        source: module,
        optional: peerDependenciesMeta?.[name]?.optional,
        destination,
      };

      peerDependencyInfos.push(pdi);
    }
  }

  return { peerDependencyInfos };
}
