import useCollapse from '../../hooks/useCollapse.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import * as styles from './CollapsedModules.module.scss';

export default function CollapsedModules() {
  const [collapse, setCollapse] = useCollapse();

  if (collapse.length === 0) {
    return (
      <div className={styles.collapseInfo}>
        (Shift-click modules in graph to expand/collapse)
      </div>
    );
  }

  return (
    <CollapsibleSection
      title="Collapsed modules"
      count={collapse.length}
      className={styles.root}
    >
      <ul className={styles.list}>
        {collapse.map(name => (
          <li key={name} className={styles.item}>
            <button
              className={styles.remove}
              type="button"
              aria-label={`Remove ${name} from collapsed modules`}
              onClick={() => {
                setCollapse(collapse.filter(item => item !== name));
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
