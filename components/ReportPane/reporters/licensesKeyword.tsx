import simplur from 'simplur';
import { cn } from '../../../lib/dom.ts';
import type { OSIKeyword } from '../../../lib/licenses.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import type { RenderedAnalysis } from '../analyzers/Analyzer.tsx';
import type { LicenseAnalysisState } from '../analyzers/analyzeLicenses.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './modulesAll.module.scss';

export function licensesKeyword(keyword: OSIKeyword) {
  return function ({ modulesByKeyword }: LicenseAnalysisState) {
    const modules = modulesByKeyword.get(keyword);
    if (!modules) {
      return undefined;
    }

    const summary = simplur`Modules with "${keyword}" license (${modules.length})`;

    const details = modules
      .toSorted((a, b) => a.key.localeCompare(b.key))
      .map(module => (
        <div
          key={module.key}
          className={cn(styles.row, reportItemStyles.zebraRow)}
        >
          <Selectable className={cn(styles.name)} value={module.key} />
        </div>
      ));

    return { type: 'warn', summary, details } as RenderedAnalysis;
  };
}
