import { QueryType } from '../../../lib/ModuleCache.ts';
import type Module from '../../../lib/Module.ts';
import { LICENSES } from '../../../lib/licenses.ts';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { GroupRow } from '../GroupRow.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './LicensesAll.module.scss';

function LicenseRow({
  license,
  modules,
}: {
  license: string;
  modules: Module[];
}) {
  const keywords = LICENSES[license.toLowerCase()]?.keywords;

  return (
    <GroupRow
      modules={modules}
      heading={
        <>
          <Selectable
            type={QueryType.License}
            value={license}
            label={license || '(unlicensed)'}
          />
          {keywords && (
            <div className={styles.keywords}>
              {keywords.map(k => (
                <span key={k} className={styles.keyword}>
                  {k}
                </span>
              ))}
            </div>
          )}
        </>
      }
    />
  );
}

export default function LicensesAll() {
  const { modulesByLicense } = useLicenseAnalysis();

  if (modulesByLicense.size === 0) {
    return null;
  }

  return (
    <ReportItem title="Licenses" count={modulesByLicense.size}>
      <Rows>
        {[...modulesByLicense]
          .toSorted(([a], [b]) => a.localeCompare(b))
          .map(([license, modules]) => (
            <LicenseRow key={license} license={license} modules={modules} />
          ))}
      </Rows>
    </ReportItem>
  );
}
