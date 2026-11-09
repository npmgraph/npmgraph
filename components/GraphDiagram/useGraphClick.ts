import { $, closestElementOptional } from 'select-dom';
import useCollapse from '../../hooks/useCollapse.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import { useTab } from '../../hooks/useTab.ts';
import { toggleItem } from '../../lib/array-util.ts';
import { PaneType } from '../../lib/constants.ts';
import { getCachedModule, QueryType } from '../../lib/ModuleCache.ts';
import * as styles from './GraphDiagram.module.scss';

// Select a module (or deselect with an empty click), or collapse it with Shift
export default function useGraphClick() {
  const [, selectTab] = useTab();
  const setGraphSelection = useGraphSelection()[2];
  const [collapse, setCollapse] = useCollapse();

  function toggleCollapsed(name: string) {
    setCollapse(toggleItem(collapse, name));
  }

  return (event: React.MouseEvent) => {
    const { target } = event;
    if (
      !(target instanceof Element) ||
      // Allow opening the link in a new tab
      event.metaKey ||
      closestElementOptional(`.${styles.graphControls}`, target)
    ) {
      return;
    }

    const node = closestElementOptional('g.node', target);
    if (node) {
      // Don't navigate to link
      event.preventDefault();
    }

    const moduleKey = node ? $('title', node)?.textContent?.trim() : '';
    const module = moduleKey === '' ? undefined : getCachedModule(moduleKey);

    // Toggle exclude filter?
    if (node && event.shiftKey) {
      if (module) {
        toggleCollapsed(module.name);
      }

      return;
    }

    setGraphSelection(QueryType.Default, moduleKey);
    if (moduleKey !== '') {
      selectTab(PaneType.MODULE);
    }
  };
}
