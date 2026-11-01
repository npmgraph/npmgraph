import { ExternalLink } from '../../ui/ExternalLink.tsx';
import LicensesKeyword from './LicensesKeyword.tsx';

export default function LicensesObsolete() {
  return (
    <LicensesKeyword keyword="obsolete">
      "Obsolete" licenses have a newer version available. Consider asking the
      module owner to update to a more recent version. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </LicensesKeyword>
  );
}
