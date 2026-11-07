import { useEffect, useState, type ReactNode } from 'react';
import useGraph from '../../../hooks/useGraph.ts';
import { analyzeLicenses } from './analyzeLicenses.ts';
import { analyzeMaintainers } from './analyzeMaintainers.ts';
import { analyzeModules } from './analyzeModules.ts';
import { analyzePeerDependencies } from './analyzePeerDependencies.ts';
import { AnalysisContext, type Analysis } from './useAnalysis.ts';

// Analyzes the graph once, for all the reports to share
export default function AnalysisProvider({
  children,
}: {
  children: ReactNode;
}) {
  const graph = useGraph();
  const [analysis, setAnalysis] = useState<Analysis | undefined>();

  useEffect(() => {
    const modules = analyzeModules(graph);
    const peerDependencies = analyzePeerDependencies(graph);
    const maintainers = analyzeMaintainers(graph);

    void analyzeLicenses(graph).then(licenses => {
      setAnalysis({
        modules,
        peerDependencies,
        maintainers,
        licenses,
      });
    });
  }, [graph]);

  return analysis ? (
    <AnalysisContext value={analysis}>{children}</AnalysisContext>
  ) : (
    <>{children}</>
  );
}
