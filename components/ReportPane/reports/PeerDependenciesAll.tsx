import { QueryType } from '../../../lib/ModuleCache.ts';
import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import {
  type PeerDependenciesState,
  type PeerDependencyInfo,
} from '../analyzers/analyzePeerDependencies.ts';
import { usePeerDependencyAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './PeerDependenciesAll.module.scss';

export function peerDependenciesAll({
  peerDependencyInfos,
}: PeerDependenciesState) {
  if (peerDependencyInfos.length === 0) {
    return;
  }

  const peerDepsBySource: Map<string, PeerDependencyInfo[]> = Map.groupBy(
    peerDependencyInfos,
    (pdi: PeerDependencyInfo) => pdi.source.key,
  );

  const details = [...peerDepsBySource.keys()].toSorted().map(sourceName => {
    const pdis = peerDepsBySource.get(sourceName)!;

    return (
      <div key={sourceName}>
        <div className={styles.header}>
          <span>
            <Selectable value={sourceName} label={pdis[0]!.source.label} />{' '}
          </span>
        </div>
        <div className={styles.section}>
          <div className={styles.headerRow}>
            <span className={styles.wants}>Wants</span>
            <span className={styles.gets}>Gets</span>
          </div>

          {pdis.map(pdi => {
            const { name, optional, versionRange, destination } = pdi;
            return (
              <div
                key={`${pdi.name}${pdi.versionRange}`}
                className={cn(reportItemStyles.zebraRow, styles.row)}
              >
                <span className={styles.wants}>
                  {name}@{versionRange}
                  {optional ? <i>(optional)</i> : ''}
                </span>
                <span className={styles.gets}>
                  {destination ? (
                    <Selectable
                      type={QueryType.Default}
                      label={destination.version}
                      value={destination.key}
                    />
                  ) : (
                    <i>{optional ? '—' : 'missing'}</i>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  return {
    type: 'info',
    summary: 'Peer dependencies',
    count: peerDependencyInfos.length,
    details,
  } as RenderedAnalysis;
}

export default function PeerDependenciesAll() {
  const data = usePeerDependencyAnalysis();

  return <ReportItem data={data} reporter={peerDependenciesAll} />;
}
