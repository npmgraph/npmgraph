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
  const details = Array.from(modulesByLicense.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([license, modules]) => {
      const keywords = LICENSES[license.toLowerCase()]?.keywords;

      return (
        <div
          className={cn(styles.root, reportItemStyles.zebraRow)}
          key={license}
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
                  <span className={styles.keyword} key={k}>
                    {k}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.modules}>
            {modules.map(m => (
              <Selectable
                value={m.key}
                key={m.key}
                className={styles.selectable}
              />
            ))}
          </div>
        </div>
      );
    });

  if (details.length <= 0) return;

  const summary = simplur`All licenses (${details.length})`;
  return { type: 'info', summary, details } as RenderedAnalysis;
}
