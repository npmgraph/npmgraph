import { QueryType } from '../../../lib/ModuleCache.ts';
import type Module from '../../../lib/Module.ts';
import { cn } from '../../../lib/dom.ts';
import { LICENSES } from '../../../lib/licenses.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.css';
import * as styles from './LicensesAll.module.css';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

function Row({ license, modules }: { license: string; modules: Module[] }) {
  const keywords = LICENSES[license.toLowerCase()]?.keywords;

  return (
    <div className={cn(styles.root, reportItemStyles.zebraRow)}>
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
}

export default function LicensesAll() {
  const { modulesByLicense } = useLicenseAnalysis();

  if (modulesByLicense.size === 0) {
    return null;
  }

  return (
    <ReportItem title="Licenses" count={modulesByLicense.size}>
      {[...modulesByLicense]
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([license, modules]) => (
          <Row key={license} license={license} modules={modules} />
        ))}
    </ReportItem>
  );
}
