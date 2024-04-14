import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import { RenderedAnalysis } from '../Analyzer.js';
import { PeerDependenciesState } from '../analyzePeerDependencies.js';
import styles from './peerDependenciesAll.module.scss';

export function peerDependenciesAll({
  peerDepsBySource,
}: PeerDependenciesState): RenderedAnalysis {
  let nPeerDependencies = 0;
  const details = Array.from(peerDepsBySource.keys())
    .sort()
    .map(sourceName => {
      const pdis = peerDepsBySource.get(sourceName)!;

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
              const { name, optional, versionRange, destination } = pdi;
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
                      <i>{optional ? '(optional)' : 'unresolved'}</i>
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

  return { type: 'info', summary, details };
}
