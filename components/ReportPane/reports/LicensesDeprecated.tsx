import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { ModuleRows } from '../../ui/Row.tsx';
import type Module from '../../../lib/Module.ts';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

export default function LicensesDeprecated() {
  const { deprecatedLicenseModules } = useLicenseAnalysis();

  if (deprecatedLicenseModules.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Modules with deprecated licenses"
      count={deprecatedLicenseModules.length}
      description={
        <>
          Deprecated licenses have been superseded or are no longer recommended.
          Consider asking the module owner to update to a more current license.
          See{' '}
          <ExternalLink href="https://spdx.org/licenses/">
            SPDX Licenses
          </ExternalLink>
          .
        </>
      }
    >
      <ModuleRows
        modules={deprecatedLicenseModules.toSorted((a: Module, b: Module) =>
          a.key.localeCompare(b.key),
        )}
      />
    </ReportItem>
  );
}
