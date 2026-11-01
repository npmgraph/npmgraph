import type { ReactNode } from 'react';
import { cn } from '../../../lib/dom.ts';
import type { OSIKeyword } from '../../../lib/licenses.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './ModuleList.module.scss';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

export default function LicensesKeyword({
  keyword,
  children,
}: {
  keyword: OSIKeyword;
  children: ReactNode;
}) {
  const modules = useLicenseAnalysis().modulesByKeyword.get(keyword);

  if (!modules) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title={`Modules with "${keyword}" license`}
      count={modules.length}
    >
      <p>{children}</p>
      {modules
        .toSorted((a, b) => a.key.localeCompare(b.key))
        .map(module => (
          <div
            key={module.key}
            className={cn(styles.row, reportItemStyles.zebraRow)}
          >
            <Selectable
              className={cn(styles.name)}
              value={module.key}
              label={module.label}
            />
          </div>
        ))}
    </ReportItem>
  );
}
