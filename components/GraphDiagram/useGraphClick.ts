import { $, closestElementOptional } from 'select-dom';
import useCollapse from '../../hooks/useCollapse.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { PaneType, PARAM_HIDE } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { getCachedModule, QueryType } from '../../lib/ModuleCache.ts';
import * as styles from './GraphDiagram.module.scss';

// Select a module (or deselect with an empty click), or collapse it with Shift
export default function useGraphClick() {
  const [, setPane] = useGlobalState('pane');
  const [, setZenMode] = useHashParam(PARAM_HIDE);
  const setGraphSelection = useGraphSelection()[2];
  const toggleCollapsed = useCollapse()[2];

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

    if (node) {
      setZenMode('');
    }

    setGraphSelection(QueryType.Default, moduleKey);
    if (moduleKey !== '') {
      setPane(PaneType.MODULE);
    }
  };
}
