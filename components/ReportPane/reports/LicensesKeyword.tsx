import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { ModuleRows } from '../../ui/Row.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

const descriptions = {
  obsolete:
    '"Obsolete" licenses have a newer version available. Consider asking the module owner to update to a more recent version.',
  discouraged:
    '"Discouraged" licenses typically have a more popular alternative.',
};

export default function LicensesKeyword({
  keyword,
}: {
  keyword: keyof typeof descriptions;
}) {
  const modules = useLicenseAnalysis().modulesByKeyword.get(keyword);

  if (!modules) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title={`Modules with "${keyword}" license`}
      count={modules.length}
      description={
        <>
          {descriptions[keyword]} See{' '}
          <ExternalLink href="https://opensource.org/licenses/">
            OSI Licenses
          </ExternalLink>
          .
        </>
      }
    >
      <ModuleRows
        modules={modules.toSorted((a, b) => a.key.localeCompare(b.key))}
      />
    </ReportItem>
  );
}
