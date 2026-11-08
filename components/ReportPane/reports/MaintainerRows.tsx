import { QueryType } from '../../../lib/ModuleCache.ts';
import { Gravatar } from '../../ui/Gravatar.tsx';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type { MaintainerAnalysisState } from '../analyzers/analyzeMaintainers.ts';
import { GroupRow } from '../GroupRow.tsx';

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
                  <Selectable type={QueryType.Maintainer} value={name} />
                </>
              }
            />
          );
        })}
    </Rows>
  );
}
