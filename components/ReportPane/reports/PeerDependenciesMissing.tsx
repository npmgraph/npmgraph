import { usePeerDependencyAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';
import type { PeerDependenciesState } from '../analyzers/analyzePeerDependencies.ts';
import { peerDependenciesAll } from './PeerDependenciesAll.tsx';

function peerDependenciesMissing({
  peerDependencyInfos,
}: PeerDependenciesState) {
  const missingInfos = peerDependencyInfos.filter(
    pdi => !pdi.destination && !pdi.optional,
  );
  const result = peerDependenciesAll({ peerDependencyInfos: missingInfos });
  if (!result) {
    return;
  }

  return {
    type: 'warn',
    summary: 'Missing peer dependencies',
    count: missingInfos.length,
    details: result?.details,
  } as RenderedAnalysis;
}

export default function PeerDependenciesMissing() {
  const data = usePeerDependencyAnalysis();

  return <ReportItem data={data} reporter={peerDependenciesMissing} />;
}
