import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useSelectedModules } from '../../hooks/useSelectedModules.ts';
import { Panel } from '../ui/Panel.tsx';
import ModulePane from './ModulePane.tsx';
import * as styles from './ModulePanel.module.scss';

function useSubtitle() {
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
    <Panel
      title="Module"
      subtitle={useSubtitle()}
      isOpen={isOpen}
      className={styles.sheet}
      bodyClassName={styles.body}
      onToggle={() => {
        setOpen(!isOpen);
      }}
    >
      <ModulePane />
    </Panel>
  );
}
