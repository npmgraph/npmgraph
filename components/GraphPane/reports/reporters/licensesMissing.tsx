import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { LicenseAnalysisState } from '../analyzeLicenses.js';
import styles from './licensesAll.module.scss';

export function licensesMissing({
  unlicensedModules,
}: LicenseAnalysisState): RenderedAnalysis {
  if (!unlicensedModules.length)
    return;

  const summary = simplur`Unlicensed modules (${unlicensedModules.length})`;

  const details = unlicensedModules
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(module => (
      <div className={cn(styles.row, 'zebra-row')} key={module.key}>
        <Selectable
          className={cn(styles.name)}
          type="exact"
          value={module.key}
        />
      </div>
    ));

  return { type: 'warn', summary, details };
}
