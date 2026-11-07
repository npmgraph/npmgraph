import { QueryType } from '../../../lib/ModuleCache.ts';
import type Module from '../../../lib/Module.ts';
import type { LicenseIssue } from '../../../lib/licenses.ts';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { GroupRow } from '../GroupRow.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

const issueBadges: Record<LicenseIssue, string> = {
  'no-osi': 'OSI',
  'no-fsf': 'FSF',
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
        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          <Selectable
            type={QueryType.License}
            value={license}
            label={license || '(unlicensed)'}
          />
          {issues && issues.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25em' }}>
              {issues.map(issue => (
                <span
                  key={issue}
                  style={{
                    fontSize: '0.85em',
                    opacity: 0.7,
                    textDecoration: 'line-through',
                  }}
                >
                  {issueBadges[issue]}
                </span>
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

  return (
    <ReportItem title="Licenses" count={modulesByLicense.size}>
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
