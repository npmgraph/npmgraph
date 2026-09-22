import simplur from 'simplur';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { LicenseAnalysisState } from '../analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';

export function licensesMissing({ unlicensedModules }: LicenseAnalysisState) {
  if (unlicensedModules.length === 0) {
    return;
  }

  const summary = simplur`Unlicensed modules (${unlicensedModules.length})`;

  const details = unlicensedModules
    .toSorted((a, b) => a.key.localeCompare(b.key))
    .map(module => (
      <div key={module.key} className={reportItemStyles.zebraRow}>
        <Selectable value={module.key} />
      </div>
    ));

  return { type: 'warn', summary, details } as RenderedAnalysis;
}
