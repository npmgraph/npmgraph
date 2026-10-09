import type { RenderedAnalysis } from '../analyzers/Analyzer.tsx';
import type { MaintainerAnalysisState } from '../analyzers/analyzeMaintainers.tsx';
import { maintainersAll } from './maintainersAll.tsx';

export function maintainersSolo({
  soloModulesByMaintainer,
  soloModulesCount,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  // Use renderAll logic, but with only the subset of data for solo maintainers
  const results = maintainersAll({
    modulesByMaintainer: soloModulesByMaintainer,
    soloModulesByMaintainer,
    soloModulesCount,
    emailByMaintainer,
  });

  if (!results) {
    return;
  }

  return {
    type: 'warn',
    summary: 'Modules with only one maintainer',
    count: soloModulesCount,
    details: results.details,
  } as RenderedAnalysis;
}
