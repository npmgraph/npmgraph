import { QueryType } from '../../../lib/ModuleCache.ts';
import { Row, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type { PeerDependencyInfo } from '../analyzers/analyzePeerDependencies.ts';
import * as styles from './PeerDependenciesAll.module.css';

export function PeerDependencyRows({
  peerDependencyInfos,
}: {
  peerDependencyInfos: PeerDependencyInfo[];
}) {
  const peerDepsBySource: Map<string, PeerDependencyInfo[]> = Map.groupBy(
    peerDependencyInfos,
    (pdi: PeerDependencyInfo) => pdi.source.key,
  );

  return [...peerDepsBySource.keys()].toSorted().map(sourceName => {
    const pdis = peerDepsBySource.get(sourceName)!;

    return (
      <div key={sourceName} className={styles.source}>
        <Selectable value={sourceName} label={pdis[0]!.source.label} />
        <div className={styles.headerRow}>
          <span className={styles.wants}>Wants</span>
          <span>Gets</span>
        </div>

        <Rows>
          {pdis.map(pdi => {
            const { name, optional, versionRange, destination } = pdi;
            return (
              <Row key={`${pdi.name}${pdi.versionRange}`} striped>
                <span className={styles.wants}>
                  {name}@{versionRange}
                  {optional ? <i>(optional)</i> : ''}
                </span>
                {destination ? (
                  <Selectable
                    type={QueryType.Default}
                    label={destination.version}
                    value={destination.key}
                  />
                ) : (
                  <i>{optional ? '—' : 'missing'}</i>
                )}
              </Row>
            );
          })}
        </Rows>
      </div>
    );
  });
}
