import { useMemo, type ReactNode } from 'react';
import useGraph from '../../../hooks/useGraph.ts';
import { analyzeLicenses } from './analyzeLicenses.ts';
import { analyzeMaintainers } from './analyzeMaintainers.ts';
import { analyzeModules } from './analyzeModules.ts';
import { analyzePeerDependencies } from './analyzePeerDependencies.ts';
import { AnalysisContext } from './useAnalysis.ts';

// Analyzes the graph once, for all the reports to share
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const graph = useGraph();
  const analysis = useMemo(
    () => ({
      modules: analyzeModules(graph),
      peerDependencies: analyzePeerDependencies(graph),
      maintainers: analyzeMaintainers(graph),
      licenses: analyzeLicenses(graph),
    }),
    [graph],
  );

  return <AnalysisContext value={analysis}>{children}</AnalysisContext>;
}
