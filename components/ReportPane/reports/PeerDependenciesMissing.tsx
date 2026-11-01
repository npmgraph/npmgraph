import type { GraphState } from '../../../lib/graph-util.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';
import {
  analyzePeerDependencies,
  type PeerDependenciesState,
} from '../analyzers/analyzePeerDependencies.ts';
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

export function PeerDependenciesMissingReport({
  graph,
}: {
  graph: GraphState;
}) {
  return (
    <ReportItem
      data={analyzePeerDependencies(graph)}
      reporter={peerDependenciesMissing}
    />
  );
}
