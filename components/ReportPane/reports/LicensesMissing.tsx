import { Selectable } from '../../ui/Selectable.tsx';
import { type LicenseAnalysisState } from '../analyzers/analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import useReport from '../useReport.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function licensesMissing({ unlicensedModules }: LicenseAnalysisState) {
  if (unlicensedModules.length === 0) {
    return;
  }

  const details = unlicensedModules
    .toSorted((a, b) => a.key.localeCompare(b.key))
    .map(module => (
      <div key={module.key} className={reportItemStyles.zebraRow}>
        <Selectable value={module.key} label={module.label} />
      </div>
    ));

  return {
    type: 'warn',
    summary: 'Unlicensed modules',
    count: unlicensedModules.length,
    details,
  } as RenderedAnalysis;
}

export default function LicensesMissing() {
  const report = useReport(useLicenseAnalysis(), licensesMissing);

  return (
    <ReportItem report={report} type="warn">
      Modules without a declared license, or that are explicitely "UNLICENSED",
      are not opensource and may infringe on the owner's copyright. Consider
      contacting the owner to clarify licensing terms.
    </ReportItem>
  );
}
