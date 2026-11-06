import { cn } from '../../../lib/dom.ts';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.css';
import * as styles from './ModuleList.module.css';
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
    >
      <p>
        {descriptions[keyword]} See{' '}
        <ExternalLink href="https://opensource.org/licenses/">
          OSI Licenses
        </ExternalLink>
        .
      </p>
      {modules
        .toSorted((a, b) => a.key.localeCompare(b.key))
        .map(module => (
          <div
            key={module.key}
            className={cn(styles.row, reportItemStyles.zebraRow)}
          >
            <Selectable
              className={cn(styles.name)}
              value={module.key}
              label={module.label}
            />
          </div>
        ))}
    </ReportItem>
  );
}
