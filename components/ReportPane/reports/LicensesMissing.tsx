import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.css';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

export default function LicensesMissing() {
  const { unlicensedModules } = useLicenseAnalysis();

  if (unlicensedModules.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Unlicensed modules"
      count={unlicensedModules.length}
    >
      <p>
        Modules without a declared license, or that are explicitely
        "UNLICENSED", are not opensource and may infringe on the owner's
        copyright. Consider contacting the owner to clarify licensing terms.
      </p>
      {unlicensedModules
        .toSorted((a, b) => a.key.localeCompare(b.key))
        .map(module => (
          <div key={module.key} className={reportItemStyles.zebraRow}>
            <Selectable value={module.key} label={module.label} />
          </div>
        ))}
    </ReportItem>
  );
}
