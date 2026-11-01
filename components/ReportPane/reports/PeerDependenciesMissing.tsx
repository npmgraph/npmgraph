import { usePeerDependencyAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { PeerDependencyRows } from './PeerDependencyRows.tsx';

export default function PeerDependenciesMissing() {
  const missing = (
    usePeerDependencyAnalysis()?.peerDependencyInfos ?? []
  ).filter(pdi => !pdi.destination && !pdi.optional);

  if (missing.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Missing peer dependencies"
      count={missing.length}
    >
      <PeerDependencyRows peerDependencyInfos={missing} />
    </ReportItem>
  );
}
