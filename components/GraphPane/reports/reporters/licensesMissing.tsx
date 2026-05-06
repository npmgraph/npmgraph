import simplur from 'simplur';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { LicenseAnalysisState } from '../analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';

export function licensesMissing({ unlicensedModules }: LicenseAnalysisState) {
  if (!unlicensedModules.length) return;

  const summary = simplur`Unlicensed modules (${unlicensedModules.length})`;

  const details = unlicensedModules
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(module => (
      <div className={reportItemStyles.zebraRow} key={module.key}>
        <Selectable value={module.key} />
      </div>
    ));

  return { type: 'warn', summary, details } as RenderedAnalysis;
}
