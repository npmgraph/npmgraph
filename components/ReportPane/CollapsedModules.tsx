import useCollapse from '../../hooks/useCollapse.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { Button } from '../Button.tsx';
import { CollapsibleSection } from '../ui/Section.tsx';
import * as styles from './CollapsedModules.module.scss';

export default function CollapsedModules() {
  const [collapse, setCollapse] = useCollapse();

  return (
    <CollapsibleSection
      title="Collapsed modules"
      count={collapse.length || undefined}
    >
      <p className={styles.hint}>
        Shift-click modules in graph to expand/collapse
      </p>
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
        <Button
          className={styles.expandAll}
          onClick={() => {
            setCollapse([]);
          }}
        >
          Expand All
        </Button>
      )}
    </CollapsibleSection>
  );
}
