import useCollapse from '../../hooks/useCollapse.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { Button } from '../Button.tsx';
import { ReportItem } from './ReportItem.tsx';
import * as styles from './CollapsedModules.module.css';

export default function CollapsedModules() {
  const [collapse, setCollapse] = useCollapse();

  if (collapse.length === 0) {
    return null;
  }

  return (
    <ReportItem
      title="Collapsed modules"
      count={collapse.length}
      open
      description="Shift-click modules in graph to expand/collapse"
    >
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
    </ReportItem>
  );
}
