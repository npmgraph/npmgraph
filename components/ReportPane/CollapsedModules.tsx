import useCollapse from '../../hooks/useCollapse.ts';
import { CollapsibleSection } from '../ui/Section.tsx';
import * as styles from './CollapsedModules.module.scss';

export default function CollapsedModules() {
  const [collapse, setCollapse, toggleCollapsed] = useCollapse();

  if (collapse.size === 0) {
    return (
      <div className={styles.collapseInfo}>
        (Shift-click modules in graph to expand/collapse)
      </div>
    );
  }

  return (
    <CollapsibleSection
      title="Collapsed modules"
      count={collapse.size}
      className={styles.root}
    >
      <ul className={styles.list}>
        {[...collapse].map(name => (
          <li key={name} className={styles.item}>
            <button
              className={styles.remove}
              type="button"
              aria-label={`Remove ${name} from collapsed modules`}
              onClick={() => {
                toggleCollapsed(name);
              }}
            >
              ×
            </button>
            <span>{name}</span>
          </li>
        ))}
      </ul>
      {collapse.size > 1 && (
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
