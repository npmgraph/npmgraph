import { ModuleRows } from '../../ui/Row.tsx';
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
      description={
        <>
          Modules without a declared license, or that are explicitely
          "UNLICENSED", are not opensource and may infringe on the owner's
          copyright. Consider contacting the owner to clarify licensing terms.
        </>
      }
    >
      <ModuleRows
        modules={unlicensedModules.toSorted((a, b) =>
          a.key.localeCompare(b.key),
        )}
      />
    </ReportItem>
  );
}
