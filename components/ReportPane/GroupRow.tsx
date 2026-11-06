import type { ReactNode } from 'react';
import type Module from '../../lib/Module.ts';
import { Row } from '../ui/Row.tsx';
import { Selectable } from '../ui/Selectable.tsx';
import * as styles from './GroupRow.module.css';

// A heading (e.g. a license or a maintainer) next to the modules it applies to
export function GroupRow({
  heading,
  modules,
}: {
  heading: ReactNode;
  modules: Iterable<Module>;
}) {
  return (
    <Row className={styles.group}>
      <div className={styles.heading}>{heading}</div>
      <div className={styles.modules}>
        {[...modules].map(module => (
          <Selectable
            key={module.key}
            value={module.key}
            label={module.label}
          />
        ))}
      </div>
    </Row>
  );
}
