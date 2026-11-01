import type { GraphState } from '../../../lib/graph-util.ts';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { ReportItem } from '../ReportItem.tsx';
import { analyzeLicenses } from '../analyzers/analyzeLicenses.ts';
import { licensesKeyword } from './LicensesKeyword.tsx';

export function LicensesObsoleteReport({ graph }: { graph: GraphState }) {
  return (
    <ReportItem
      type="warn"
      data={analyzeLicenses(graph)}
      reporter={licensesKeyword('obsolete')}
    >
      "Obsolete" licenses have a newer version available. Consider asking the
      module owner to update to a more recent version. See{' '}
      <ExternalLink href="https://opensource.org/licenses/">
        OSI Licenses
      </ExternalLink>
      .
    </ReportItem>
  );
}
