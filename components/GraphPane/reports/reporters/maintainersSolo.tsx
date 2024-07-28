import simplur from 'simplur';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { MaintainerAnalysisState } from '../analyzeMaintainers.js';
import { maintainersAll } from './maintainersAll.js';

export function maintainersSolo({
  soloModulesByMaintainer,
  soloModulesCount,
  emailByMaintainer,
}: MaintainerAnalysisState): RenderedAnalysis {
  // Use renderAll logic, but with only the subset of data for solo maintainers
  const results = maintainersAll({
    modulesByMaintainer: soloModulesByMaintainer,
    soloModulesByMaintainer,
    soloModulesCount,
    emailByMaintainer,
  });

  if (!results)
    return;

  return {
    type: 'warn',
    summary: simplur`Modules with only one maintainer (${soloModulesCount})`,
    details: results.details,
  };
}
