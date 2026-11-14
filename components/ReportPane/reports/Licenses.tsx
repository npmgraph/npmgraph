import { useEffect, useState } from 'react';
import type Module from '../../../lib/Module.ts';
import { QueryType } from '../../../lib/ModuleCache.ts';
import {
  getAllLicenses,
  getLicenseIssues,
  type LicenseIssue,
  type SPDXLicense,
} from '../../../lib/licenses.ts';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { GroupRow } from '../GroupRow.tsx';
import { ReportItem } from '../ReportItem.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import * as styles from './Licenses.module.css';

const WARN_SYMBOL = '\u{26A0}';
const UNLICENSED = 'unlicensed';

const issueBadges: Record<LicenseIssue, string> = {
  'no-osi': 'non-OSI',
  'no-fsf': 'non-FSF',
  deprecated: 'Deprecated',
};

function Badge({ children }: { children: string }) {
  return (
    <span className={styles.keyword}>
      <span className={styles.warnIcon}>{WARN_SYMBOL}</span>
      {children}
    </span>
  );
}

function useSpdxLicenses() {
  const [spdxLicenses, setSpdxLicenses] = useState<Map<string, SPDXLicense>>();

  useEffect(() => {
    void getAllLicenses().then(setSpdxLicenses);
  }, []);

  return spdxLicenses;
}

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
        <>
          <Selectable
            type={QueryType.License}
            value={license}
            label={license}
          />
          {issues && (
            <div className={styles.keywords}>
              {issues.map(issue => (
                <Badge key={issue}>{issueBadges[issue]}</Badge>
              ))}
            </div>
          )}
        </>
      }
    />
  );
}

export default function Licenses() {
  const { modulesByLicense, unlicensedModules } = useLicenseAnalysis();
  const spdxLicenses = useSpdxLicenses();

  const licenses = [...modulesByLicense].filter(
    ([license]) => license !== UNLICENSED,
  );
  const hasUnlicensed = unlicensedModules.length > 0;
  const issuesByLicense = new Map<string, LicenseIssue[]>();

  for (const [license] of licenses) {
    const spdxLicense = spdxLicenses?.get(license);
    const issues = spdxLicense ? getLicenseIssues(spdxLicense) : [];
    if (issues.length > 0) {
      issuesByLicense.set(license, issues);
    }
  }

  // Licenses with warnings first, then alphabetical
  licenses.sort(
    ([a], [b]) =>
      Number(issuesByLicense.has(b)) - Number(issuesByLicense.has(a)) ||
      a.localeCompare(b),
  );

  const count = licenses.length + (hasUnlicensed ? 1 : 0);
  if (count === 0) {
    return null;
  }

  return (
    <ReportItem
      title="Licenses"
      count={count}
      type={hasUnlicensed || issuesByLicense.size > 0 ? 'warn' : 'info'}
      description={
        hasUnlicensed && (
          <>
            Modules without a declared license, or that are explicitely
            "UNLICENSED", are not opensource and may infringe on the owner's
            copyright. Consider contacting the owner to clarify licensing terms.
          </>
        )
      }
    >
      <Rows>
        {hasUnlicensed && (
          <GroupRow
            modules={unlicensedModules.toSorted((a, b) =>
              a.key.localeCompare(b.key),
            )}
            heading={
              <div className={styles.keywords}>
                <Badge>Unlicensed</Badge>
              </div>
            }
          />
        )}
        {licenses.map(([license, modules]) => (
          <LicenseRow
            key={license}
            license={license}
            modules={modules}
            issues={issuesByLicense.get(license)}
          />
        ))}
      </Rows>
    </ReportItem>
  );
}
