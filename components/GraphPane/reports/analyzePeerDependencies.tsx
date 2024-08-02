import { satisfies } from 'semver';
import type Module from '../../../lib/Module.js';
import type { GraphState } from '../../GraphDiagram/graph_util.js';

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
    if (!peerDependencies) continue;

    for (const [name, versionRange] of Object.entries(peerDependencies)) {
      const pdi: PeerDependencyInfo = {
        name,
        versionRange,
        source: module,
        optional: peerDependenciesMeta?.[name]?.optional,
        destination: undefined,
      };

      for (const { module: mod } of moduleInfos.values()) {
        if (mod.name !== name || !satisfies(mod.version, versionRange))
          continue;

        pdi.destination = mod;
      }

      peerDependencyInfos.push(pdi);
    }
  }

  return { peerDependencyInfos };
}
