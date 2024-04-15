import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import { RenderedAnalysis } from '../Analyzer.js';
import {
  PeerDependenciesState,
  PeerDependencyInfo,
} from '../analyzePeerDependencies.js';
import styles from './peerDependenciesAll.module.scss';

export function peerDependenciesAll({
  peerDependencyInfos,
}: PeerDependenciesState): RenderedAnalysis {
  if (!peerDependencyInfos.length) return;

  // @ts-ignore Unignore once TS types know about Map.groupBy()
  const peerDepsBySource: Map<string, PeerDependencyInfo[]> = Map.groupBy(
    peerDependencyInfos,
    (pdi: PeerDependencyInfo) => pdi.source.key,
  );

  const details = Array.from(peerDepsBySource.keys())
    .sort()
    .map(sourceName => {
      const pdis = peerDepsBySource.get(sourceName)!;

      return (
        <div key={sourceName}>
          <div className={styles.header}>
            <span>
              <Selectable type="exact" value={sourceName} />{' '}
            </span>
          </div>
          <div className={styles.section}>
            <div className={styles.header_row}>
              <span className={styles.wants}>Wants</span>
              <span className={styles.gets}>Gets</span>
            </div>

            {pdis.map(pdi => {
              const { name, optional, versionRange, destination } = pdi;
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

  const summary = `All peer dependencies (${peerDependencyInfos.length})`;

  return { type: 'info', summary, details };
}

export function peerDependenciesUnresolved({
  peerDependencyInfos,
}: PeerDependenciesState): RenderedAnalysis {
  const unresolvedInfos = peerDependencyInfos.filter(
    pdi => !pdi.destination && !pdi.optional,
  );
  const result = peerDependenciesAll({ peerDependencyInfos: unresolvedInfos });
  if (!result) return;

  return {
    type: 'warn',
    summary: `Unresolved peer dependencies (${unresolvedInfos.length})`,
    details: result?.details,
  };
}
