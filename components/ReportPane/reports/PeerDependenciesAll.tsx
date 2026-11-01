import { usePeerDependencyAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { PeerDependencyRows } from './PeerDependencyRows.tsx';

export default function PeerDependenciesAll() {
  const peerDependencyInfos =
    usePeerDependencyAnalysis()?.peerDependencyInfos ?? [];

  if (peerDependencyInfos.length === 0) {
    return null;
  }

  return (
    <ReportItem title="Peer dependencies" count={peerDependencyInfos.length}>
      <PeerDependencyRows peerDependencyInfos={peerDependencyInfos} />
    </ReportItem>
  );
}
