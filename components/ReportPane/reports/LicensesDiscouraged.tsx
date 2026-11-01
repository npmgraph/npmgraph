import { ExternalLink } from '../../ui/ExternalLink.tsx';
import LicensesKeyword from './LicensesKeyword.tsx';

export default function LicensesDiscouraged() {
  return (
    <LicensesKeyword keyword="discouraged">
      "Discouraged" licenses typically have a more popular alternative. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </LicensesKeyword>
  );
}
