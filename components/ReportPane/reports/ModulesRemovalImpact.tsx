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

  const max = Math.max(...removalImpact.map(({ dropped }) => dropped));

  return (
    <ReportItem
      title="Removal impact"
      count={removalImpact.length}
      description="Number of modules that would leave the graph if you removed or replaced each dependency: the dependency itself plus whatever only it needs. Modules that something else also depends on stay."
    >
      <Rows>
        {removalImpact.map(({ module, dropped }) => (
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
            </span>
            <span className={styles.count}>{dropped}</span>
          </Row>
        ))}
      </Rows>
    </ReportItem>
  );
}
