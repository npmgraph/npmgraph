import simplur from 'simplur';
import { RenderedAnalysis } from '../Analyzer.js';
import { MaintainerAnalysisState } from '../analyzeMaintainers.js';
import { maintainersRenderAll } from './maintainersRenderAll.js';

export function maintainersRenderSolo({
  soloModulesByMaintainer,
  soloModulesCount,
  emailByMaintainer,
}: MaintainerAnalysisState): RenderedAnalysis {
  // Use renderAll logic, but with only the subset of data for solo maintainers
  const results = maintainersRenderAll({
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
  };
}
