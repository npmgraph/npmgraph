import { ExternalLink } from '../../ui/ExternalLink.tsx';
import useReport from '../useReport.ts';
import { ReportItem } from '../ReportItem.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { licensesKeyword } from './LicensesKeyword.tsx';

const discouragedLicenses = licensesKeyword('discouraged');

export default function LicensesDiscouraged() {
  const report = useReport(useLicenseAnalysis(), discouragedLicenses);

  return (
    <ReportItem type="warn" report={report}>
      "Discouraged" licenses typically have a more popular alternative. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </ReportItem>
  );
}
