import AlertFillIcon from 'octicons-plain-react/AlertFill';
import { QueryType } from '../../../lib/ModuleCache.ts';
import { Gravatar } from '../../ui/Gravatar.tsx';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import {
  UNNAMED_MAINTAINER,
  type MaintainerAnalysisState,
} from '../analyzers/analyzeMaintainers.ts';
import { GroupRow } from '../GroupRow.tsx';
import * as styles from './MaintainerRows.module.css';

export function MaintainerRows({
  modulesByMaintainer,
  emailByMaintainer,
}: Pick<MaintainerAnalysisState, 'modulesByMaintainer' | 'emailByMaintainer'>) {
  return (
    <Rows>
      {[...modulesByMaintainer]
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([name, modules]) => {
          const email = emailByMaintainer.get(name);

          return (
            <GroupRow
              key={name}
              modules={modules}
              heading={
                <>
                  {email && <Gravatar email={email} />}
                  {name === UNNAMED_MAINTAINER && (
                    <AlertFillIcon className={styles.warnIcon} />
                  )}
                  <Selectable type={QueryType.Maintainer} value={name} />
                </>
              }
            />
          );
        })}
    </Rows>
  );
}
