import { ExternalLink } from '../../ui/ExternalLink.tsx';
import useReport from '../useReport.ts';
import { ReportItem } from '../ReportItem.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { licensesKeyword } from './LicensesKeyword.tsx';

const obsoleteLicenses = licensesKeyword('obsolete');

export default function LicensesObsolete() {
  const report = useReport(useLicenseAnalysis(), obsoleteLicenses);

  return (
    <ReportItem type="warn" report={report}>
      "Obsolete" licenses have a newer version available. Consider asking the
      module owner to update to a more recent version. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </ReportItem>
  );
}
