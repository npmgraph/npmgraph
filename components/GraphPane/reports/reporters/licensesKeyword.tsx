import simplur from 'simplur';
import { cn } from '../../../../lib/dom.ts';
import type { OSIKeyword } from '../../../../lib/licenses.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { LicenseAnalysisState } from '../analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './modulesAll.module.scss';

export function licensesKeyword(keyword: OSIKeyword) {
  return function ({ modulesByKeyword }: LicenseAnalysisState) {
    const modules = modulesByKeyword.get(keyword);
    if (!modules) return undefined;

    const summary = simplur`Modules with "${keyword}" license (${modules.length})`;

    const details = modules
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(module => (
        <div
          className={cn(styles.row, reportItemStyles.zebraRow)}
          key={module.key}
        >
          <Selectable className={cn(styles.name)} value={module.key} />
        </div>
      ));

    return { type: 'warn', summary, details } as RenderedAnalysis;
  };
}
