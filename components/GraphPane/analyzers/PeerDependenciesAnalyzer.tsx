import { lt, satisfies } from 'semver';
import Module from '../../../lib/Module.js';
import { cn } from '../../../lib/dom.js';
import { GraphModuleInfo } from '../../GraphDiagram/graph_util.js';
import { Selectable } from '../../Selectable.js';
import { Analyzer } from './Analyzer.js';
import styles from './PeerDependenciesAnalyzer.module.scss';

type PeerDependencyInfo = {
  name: string;
  versionRange: string;
  source: Module;
  destination: Module | undefined;
};

export class PeerDependenciesAnalyzer extends Analyzer {
  peerDeps: Map<string, PeerDependencyInfo> = new Map();
  peerDepsBySource: Map<string, PeerDependencyInfo[]> = new Map();

  map({ module }: GraphModuleInfo) {
    const peerDependencies = module.package.peerDependencies;
    if (!peerDependencies) return;

    if (!this.peerDepsBySource.has(module.key)) {
      this.peerDepsBySource.set(module.key, []);
    }
    const pdis = this.peerDepsBySource.get(module.key)!;

    const { moduleInfos } = this.graph;
    for (const [name, versionRange] of Object.entries(peerDependencies)) {
      const pdi: PeerDependencyInfo = {
        name,
        versionRange: versionRange,
        source: module,
        destination: undefined,
      };

      for (const { module: mod } of moduleInfos.values()) {
        if (mod.name !== name) continue;

        if (satisfies(mod.version, versionRange)) {
          pdi.destination = mod;
          // Take the highest version that satisfies the peer dependency
          const currentPdi = this.peerDeps.get(name);
          if (
            !currentPdi?.destination ||
            lt(currentPdi.destination.version, pdi.destination.version)
          ) {
            this.peerDeps.set(name, pdi);
          }
        }
      }

      pdis.push(pdi);
    }
  }

  reduce() {
    let nPeerDependencies = 0;
    const details = Array.from(this.peerDepsBySource.keys())
      .sort()
      .map(sourceName => {
        const pdis = this.peerDepsBySource.get(sourceName)!;

        return (
          <div key={sourceName}>
            <div className={styles.header}>
              <span>
                <Selectable type="exact" value={sourceName} />{' '}
                <span className={styles.dim}>needs</span>
              </span>
              <span className={styles.dim}>resolves to</span>
            </div>
            <div className={styles.section}>
              {pdis.map(pdi => {
                const { name, versionRange, destination } = pdi;
                nPeerDependencies++;
                return (
                  <div
                    className={cn('zebra-row', styles.row)}
                    key={`${pdi.name}${pdi.versionRange}`}
                  >
                    <span className={styles.wants}>
                      {name}@{versionRange}
                    </span>
                    <span className={styles.gets}>
                      {destination ? (
                        <Selectable
                          type="exact"
                          label={destination.version}
                          value={destination.key}
                        />
                      ) : (
                        <i>unresolved</i>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      });

    if (!nPeerDependencies) return;

    const summary = `All peer dependencies (${nPeerDependencies})`;

    return { summary, details };
  }
}
