import { useMemo, use, type ReactNode } from 'react';
import useGraph from '../../../hooks/useGraph.ts';
import { analyzeLicenses } from './analyzeLicenses.ts';
import { analyzeMaintainers } from './analyzeMaintainers.ts';
import { analyzeModules } from './analyzeModules.ts';
import { analyzePeerDependencies } from './analyzePeerDependencies.ts';
import { AnalysisContext } from './useAnalysis.ts';

// Analyzes the graph once, for all the reports to share
export default function AnalysisProvider({
  children,
}: {
  children: ReactNode;
}) {
  const graph = useGraph();
  const modules = analyzeModules(graph);
  const peerDependencies = analyzePeerDependencies(graph);
  const maintainers = analyzeMaintainers(graph);

  // Memoize the promise itself, not just the unwrapped value
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const licensesPromise = useMemo(() => analyzeLicenses(graph), [graph]);
  const licenses = use(licensesPromise);

  const value = useMemo(
    () => ({
      modules,
      peerDependencies,
      maintainers,
      licenses,
    }),
    [modules, peerDependencies, maintainers, licenses],
  );

  return <AnalysisContext value={value}>{children}</AnalysisContext>;
}
