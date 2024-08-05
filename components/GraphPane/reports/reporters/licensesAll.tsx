import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { LICENSES } from '../../../../lib/licenses.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { LicenseAnalysisState } from '../analyzeLicenses.js';
import * as styles from './licensesAll.module.scss';

export function licensesAll({
  modulesByLicense,
}: LicenseAnalysisState): RenderedAnalysis {
  const details = Array.from(modulesByLicense.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([license, modules]) => {
      const keywords = LICENSES[license.toLowerCase()]?.keywords;

      return (
        <div className={cn(styles.root, 'zebra-row')} key={license}>
          <div className={styles.license}>
            <Selectable
              type="license"
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
              <Selectable type="exact" value={m.key} key={m.key} />
            ))}
          </div>
        </div>
      );
    });

  if (details.length <= 0) return;

  const summary = simplur`All licenses (${details.length})`;
  return { type: 'info', summary, details };
}
