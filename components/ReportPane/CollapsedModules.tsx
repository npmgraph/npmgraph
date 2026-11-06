import useCollapse from '../../hooks/useCollapse.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import * as styles from './CollapsedModules.module.css';

export default function CollapsedModules() {
  const [collapse, setCollapse] = useCollapse();

  if (collapse.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection title="Collapsed modules" count={collapse.length}>
      <ul className={styles.list}>
        {collapse.map(name => (
          <li key={name} className={styles.item}>
            <button
              className={styles.remove}
              type="button"
              aria-label={`Remove ${name} from collapsed modules`}
              onClick={() => {
                setCollapse(toggleItem(collapse, name));
              }}
            >
              ×
            </button>
            <span>{name}</span>
          </li>
        ))}
      </ul>
      {collapse.length > 1 && (
        <button
          className={styles.expandAll}
          type="button"
          onClick={() => {
            setCollapse([]);
          }}
        >
          Expand All
        </button>
      )}
    </CollapsibleSection>
  );
}
