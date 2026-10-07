import { Selectable } from '../../ui/Selectable.tsx';
import type { RenderedAnalysis } from '../analyzers/Analyzer.tsx';
import type { LicenseAnalysisState } from '../analyzers/analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';

export function licensesMissing({ unlicensedModules }: LicenseAnalysisState) {
  if (unlicensedModules.length === 0) {
    return;
  }

  const details = unlicensedModules
    .toSorted((a, b) => a.key.localeCompare(b.key))
    .map(module => (
      <div key={module.key} className={reportItemStyles.zebraRow}>
        <Selectable value={module.key} />
      </div>
    ));

  return {
    type: 'warn',
    summary: 'Unlicensed modules',
    count: unlicensedModules.length,
    details,
  } as RenderedAnalysis;
}
