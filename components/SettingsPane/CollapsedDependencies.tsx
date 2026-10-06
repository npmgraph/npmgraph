import useCollapse from '../../hooks/useCollapse.ts';
import { Section } from '../ui/Section.tsx';
import * as styles from './CollapsedDependencies.module.scss';

export default function CollapsedDependencies() {
  const [collapse, setCollapse] = useCollapse();

  if (collapse.length === 0) {
    return null;
  }

  return (
    <Section title="Collapsed dependencies">
      <div className={styles.list}>
        {collapse.map(name => (
          <li key={name} className={styles.item}>
            <button
              className={styles.remove}
              type="button"
              aria-label={`Remove ${name} from collapsed dependencies`}
              onClick={() => {
                setCollapse(collapse.filter(item => item !== name));
              }}
            >
              ×
            </button>
            <span>{name}</span>
          </li>
        ))}
      </div>
    </Section>
  );
}
