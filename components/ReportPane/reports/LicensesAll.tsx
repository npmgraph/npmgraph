import type Module from '../../../lib/Module.ts';
import { QueryType } from '../../../lib/ModuleCache.ts';
import type { LicenseIssue } from '../../../lib/licenses.ts';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { GroupRow } from '../GroupRow.tsx';
import { ReportItem } from '../ReportItem.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import * as styles from './LicensesAll.module.css';

const WARN_SYMBOL = '\u{26A0}';

const issueBadges: Record<LicenseIssue, string> = {
  'no-osi': 'non-OSI',
  'no-fsf': 'non-FSF',
  deprecated: 'Deprecated',
};

function LicenseRow({
  license,
  modules,
  issues,
}: {
  license: string;
  modules: Module[];
  issues?: LicenseIssue[];
}) {
  return (
    <GroupRow
      modules={modules}
      heading={
        <div className={styles.heading}>
          <Selectable
            type={QueryType.License}
            value={license}
            label={license || '(unlicensed)'}
          />
          {issues && issues.length > 0 && (
            <div className={styles.badges}>
              {issues.map(issue => (
                <div key={issue}>
                  <span className={styles.warnIcon}>{WARN_SYMBOL}</span>
                  <span className={styles.badge}>{issueBadges[issue]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}

export default function LicensesAll() {
  const { modulesByLicense, licenseIssuesByLicense } = useLicenseAnalysis();

  if (modulesByLicense.size === 0) {
    return null;
  }

  const hasIssues = licenseIssuesByLicense.size > 0;

  return (
    <ReportItem
      title="Licenses"
      count={modulesByLicense.size}
      type={hasIssues ? 'warn' : 'info'}
    >
      <Rows>
        {[...modulesByLicense]
          .toSorted(([a], [b]) => a.localeCompare(b))
          .map(([license, modules]) => (
            <LicenseRow
              key={license}
              license={license}
              modules={modules}
              issues={licenseIssuesByLicense.get(license)}
            />
          ))}
      </Rows>
    </ReportItem>
  );
}
