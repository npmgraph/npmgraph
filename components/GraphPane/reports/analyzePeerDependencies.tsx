import { lt, satisfies } from 'semver';
import Module from '../../../lib/Module.js';
import { GraphState } from '../../GraphDiagram/graph_util.js';

type PeerDependencyInfo = {
  name: string;
  optional: true | undefined;
  versionRange: string;
  source: Module;
  destination: Module | undefined;
};

export type PeerDependenciesState = {
  peerDeps: Map<string, PeerDependencyInfo>;
  peerDepsBySource: Map<string, PeerDependencyInfo[]>;
};

export function analyzePeerDependencies(
  graph: GraphState,
): PeerDependenciesState | undefined {
  const peerDeps = new Map();
  const peerDepsBySource = new Map();

  for (const { module } of graph.moduleInfos.values()) {
    const { peerDependencies, peerDependenciesMeta } = module.package;
    if (!peerDependencies) continue;

    if (!peerDepsBySource.has(module.key)) {
      peerDepsBySource.set(module.key, []);
    }
    const pdis = peerDepsBySource.get(module.key)!;

    const { moduleInfos } = graph;
    for (const [name, versionRange] of Object.entries(peerDependencies)) {
      const pdi: PeerDependencyInfo = {
        name,
        versionRange: versionRange,
        source: module,
        optional: peerDependenciesMeta?.[name]?.optional,
        destination: undefined,
      };

      for (const { module: mod } of moduleInfos.values()) {
        if (mod.name !== name) continue;

        if (satisfies(mod.version, versionRange)) {
          pdi.destination = mod;
          // Take the highest version that satisfies the peer dependency
          const currentPdi = peerDeps.get(name);
          if (
            !currentPdi?.destination ||
            lt(currentPdi.destination.version, pdi.destination.version)
          ) {
            peerDeps.set(name, pdi);
          }
        }
      }

      pdis.push(pdi);
    }
  }

  return { peerDeps, peerDepsBySource };
}
