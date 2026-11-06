import { Row, RowNote, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

export default function ModulesDeprecated() {
  const { deprecated } = useModuleAnalysis();

  if (deprecated.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Deprecated modules"
      count={deprecated.length}
      description="Deprecated modules are unsupported and may have unpatched security vulnerabilities. See the deprecation notes below for module-specific instructions."
    >
      <Rows>
        {deprecated
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map(module => (
            <Row key={module.key}>
              <Selectable value={module.key} label={module.label} />
              <RowNote>&ldquo;{module.package.deprecated}&rdquo;</RowNote>
            </Row>
          ))}
      </Rows>
    </ReportItem>
  );
}
