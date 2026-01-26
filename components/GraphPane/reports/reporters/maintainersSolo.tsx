import simplur from 'simplur';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { MaintainerAnalysisState } from '../analyzeMaintainers.tsx';
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

  if (!results) return;

  return {
    type: 'warn',
    summary: simplur`Modules with only one maintainer (${soloModulesCount})`,
    details: results.details,
  } as RenderedAnalysis;
}
