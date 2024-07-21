import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { OSIKeyword } from '../../../../lib/licenses.js';
import { Selectable } from '../../../Selectable.js';
import { RenderedAnalysis } from '../Analyzer.js';
import { LicenseAnalysisState } from '../analyzeLicenses.js';
import styles from './modulesAll.module.scss';

export function licensesKeyword(keyword: OSIKeyword) {
  return ({ modulesByKeyword }: LicenseAnalysisState): RenderedAnalysis => {
    const modules = modulesByKeyword.get(keyword);
    if (!modules) return;

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

    return { type: 'warn', summary, details };
  };
}
