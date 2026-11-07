import { createContext, use } from 'react';
import type { analyzeLicenses } from './analyzeLicenses.ts';
import type { analyzeMaintainers } from './analyzeMaintainers.ts';
import type { analyzeModules } from './analyzeModules.ts';
import type { analyzePeerDependencies } from './analyzePeerDependencies.ts';

export type Analysis = {
  modules: ReturnType<typeof analyzeModules>;
  peerDependencies: ReturnType<typeof analyzePeerDependencies>;
  maintainers: ReturnType<typeof analyzeMaintainers>;
  licenses: Awaited<ReturnType<typeof analyzeLicenses>>;
};

export const AnalysisContext = createContext<Analysis | undefined>(undefined);

function useAnalysis() {
  const analysis = use(AnalysisContext);
  if (!analysis) {
    throw new Error('useAnalysis must be used inside <AnalysisProvider>');
  }

  return analysis;
}

export const useModuleAnalysis = () => useAnalysis().modules;
export const usePeerDependencyAnalysis = () => useAnalysis().peerDependencies;
export const useMaintainerAnalysis = () => useAnalysis().maintainers;
export const useLicenseAnalysis = () => useAnalysis().licenses;
