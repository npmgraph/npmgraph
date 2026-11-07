import { QueryType } from '../../../lib/ModuleCache.ts';
import type Module from '../../../lib/Module.ts';
import { Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { GroupRow } from '../GroupRow.tsx';
import { useLicenseAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

function LicenseRow({
  license,
  modules,
}: {
  license: string;
  modules: Module[];
}) {
  return (
    <GroupRow
      modules={modules}
      heading={
        <Selectable
          type={QueryType.License}
          value={license}
          label={license || '(unlicensed)'}
        />
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
