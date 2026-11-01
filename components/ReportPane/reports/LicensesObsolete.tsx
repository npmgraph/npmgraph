import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { ReportItem } from '../ReportItem.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { licensesKeyword } from './LicensesKeyword.tsx';

export default function LicensesObsolete() {
  const data = useLicenseAnalysis();

  return (
    <ReportItem type="warn" data={data} reporter={licensesKeyword('obsolete')}>
      "Obsolete" licenses have a newer version available. Consider asking the
      module owner to update to a more recent version. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </ReportItem>
  );
}
