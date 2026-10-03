import simplur from 'simplur';
import { QueryType } from '../../../../lib/ModuleCache.ts';
import { cn } from '../../../../lib/dom.ts';
import { LICENSES } from '../../../../lib/licenses.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { LicenseAnalysisState } from '../analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './licensesAll.module.scss';

export function licensesAll({ modulesByLicense }: LicenseAnalysisState) {
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

  const summary = simplur`All licenses (${details.length})`;
  return { type: 'info', summary, details } as RenderedAnalysis;
}
