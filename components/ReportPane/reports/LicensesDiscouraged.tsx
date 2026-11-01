import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { ReportItem } from '../ReportItem.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { licensesKeyword } from './LicensesKeyword.tsx';

export default function LicensesDiscouraged() {
  const data = useLicenseAnalysis();

  return (
    <ReportItem
      type="warn"
      data={data}
      reporter={licensesKeyword('discouraged')}
    >
      "Discouraged" licenses typically have a more popular alternative. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </ReportItem>
  );
}
