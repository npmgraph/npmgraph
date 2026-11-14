import { Row, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import * as styles from './ModulesRemovalImpact.module.css';

export default function ModulesRemovalImpact() {
  const { removalImpact } = useModuleAnalysis();

  if (removalImpact.length === 0) {
    return null;
  }

  const max = Math.max(...removalImpact.map(({ total }) => total));

  return (
    <ReportItem
      title="Removal impact"
      count={removalImpact.length}
      description="Modules that would disappear from the graph if a direct dependency were removed or replaced. Sub-dependencies shared with other modules stay."
    >
      <Rows>
        {removalImpact.map(({ module, dropped, total }) => (
          <Row key={module.key}>
            <Selectable
              className={styles.name}
              value={module.key}
              label={module.label}
            />
            <span aria-hidden className={styles.bar}>
              <span
                className={styles.dropped}
                style={{ width: `${(dropped / max) * 100}%` }}
              />
              <span
                className={styles.shared}
                style={{ width: `${((total - dropped) / max) * 100}%` }}
              />
            </span>
            <span className={styles.count}>
              −{dropped} / {total}
            </span>
          </Row>
        ))}
      </Rows>
    </ReportItem>
  );
}
