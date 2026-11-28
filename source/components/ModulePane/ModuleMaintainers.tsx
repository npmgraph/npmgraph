import type Module from '../../lib/Module.ts';
import type { Maintainer } from '../../lib/Module.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import { Gravatar } from '../ui/Gravatar.tsx';
import { Row, Rows } from '../ui/Row.tsx';
import { Section } from '../ui/Section.tsx';
import { Selectable } from '../ui/Selectable.tsx';
import * as styles from './ModuleMaintainers.module.css';

export function ModuleMaintainers({ module }: { module: Module }) {
  const { maintainers } = module;

  return (
    <Section title="Maintainers" count={maintainers.length}>
      <Rows>
        {maintainers.map(
          // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment -- Incorrect types
          ({ name = 'Unknown', email }: Exclude<Maintainer, string>) => (
            <Row key={name + email} className={styles.maintainer}>
              {email && <Gravatar email={email} />}
              <Selectable type={QueryType.Maintainer} value={name} />
            </Row>
          ),
        )}
      </Rows>
    </Section>
  );
}
