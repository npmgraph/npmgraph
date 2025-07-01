import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import type { OSIKeyword } from '../../../../lib/licenses.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { LicenseAnalysisState } from '../analyzeLicenses.js';
import * as styles from './modulesAll.module.scss';

export function licensesKeyword(keyword: OSIKeyword) {
  return function ({
    modulesByKeyword,
  }: LicenseAnalysisState) {
    const modules = modulesByKeyword.get(keyword);
    if (!modules) return undefined;

    const summary = simplur`Modules with "${keyword}" license (${modules.length})`;

    const details = modules
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

    return { type: 'warn', summary, details } as RenderedAnalysis;
  };
}
