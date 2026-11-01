import type { GraphState } from '../../../lib/graph-util.ts';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { ReportItem } from '../ReportItem.tsx';
import { analyzeLicenses } from '../analyzers/analyzeLicenses.ts';
import { licensesKeyword } from './LicensesKeyword.tsx';

export function LicensesDiscouragedReport({ graph }: { graph: GraphState }) {
  return (
    <ReportItem
      type="warn"
      data={analyzeLicenses(graph)}
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
