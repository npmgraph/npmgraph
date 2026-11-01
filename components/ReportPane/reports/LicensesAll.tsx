import { QueryType } from '../../../lib/ModuleCache.ts';
import { cn } from '../../../lib/dom.ts';
import { LICENSES } from '../../../lib/licenses.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import { type LicenseAnalysisState } from '../analyzers/analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './LicensesAll.module.scss';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import useReport from '../useReport.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

function licensesAll({ modulesByLicense }: LicenseAnalysisState) {
  const details = [...modulesByLicense]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([license, modules]) => {
      const keywords = LICENSES[license.toLowerCase()]?.keywords;

      return (
        <div
          key={license}
          className={cn(styles.root, reportItemStyles.zebraRow)}
        >
          <div className={styles.license}>
            <Selectable
              type={QueryType.License}
              value={license}
              label={license || '(unlicensed)'}
            />
            {keywords ? (
              <div className={styles.keywords}>
                {keywords.map(k => (
                  <span key={k} className={styles.keyword}>
                    {k}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.modules}>
            {modules.map(m => (
              <Selectable
                key={m.key}
                value={m.key}
                label={m.label}
                className={styles.selectable}
              />
            ))}
          </div>
        </div>
      );
    });

  if (details.length === 0) {
    return;
  }

  return {
    type: 'info',
    summary: 'Licenses',
    count: details.length,
    details,
  } as RenderedAnalysis;
}

export default function LicensesAll() {
  const report = useReport(useLicenseAnalysis(), licensesAll);

  return <ReportItem report={report} />;
}
