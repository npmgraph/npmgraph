import type { PeerDependenciesState } from '../analyzers/analyzePeerDependencies.ts';
import { peerDependenciesDetails } from './peerDependenciesDetails.tsx';
import { usePeerDependencyAnalysis } from '../analyzers/useAnalysis.ts';
import useReport from '../useReport.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function peerDependenciesAll({ peerDependencyInfos }: PeerDependenciesState) {
  if (peerDependencyInfos.length === 0) {
    return;
  }

  const details = peerDependenciesDetails(peerDependencyInfos);

  return {
    type: 'info',
    summary: 'Peer dependencies',
    count: peerDependencyInfos.length,
    details,
  } as RenderedAnalysis;
}

export default function PeerDependenciesAll() {
  const report = useReport(usePeerDependencyAnalysis(), peerDependenciesAll);

  return <ReportItem report={report} />;
}
