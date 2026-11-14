import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useSelectedModules } from '../../hooks/useSelectedModules.ts';
import ModulePane from './ModulePane.tsx';
import * as styles from './ModulePanel.module.scss';

function useTitle() {
  const selectedModules = useSelectedModules();
  const [first] = selectedModules.values();
  return selectedModules.size > 1
    ? `${selectedModules.size} modules`
    : (first?.key ?? 'No module selected');
}

// Docked under the report, so selecting a module there has a visible effect
export default function ModulePanel() {
  const [isOpen, setOpen] = useGlobalState('isModulePanelOpen');

  return (
    <section className={styles.panel} aria-label="Module">
      <button
        type="button"
        className={styles.header}
        aria-expanded={isOpen}
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        <span className={styles.label}>Module</span>
        <span className={styles.title}>{useTitle()}</span>
      </button>
      {isOpen && (
        <div className={styles.body}>
          <ModulePane />
        </div>
      )}
    </section>
  );
}
