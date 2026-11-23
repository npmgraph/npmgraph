import { PaneType } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache, type QueryTypeValue } from '../lib/ModuleCache.ts';
import useGraphSelection from './useGraphSelection.ts';
import { useIsTightScreen } from './useIsTightScreen.ts';
import useReportOnly from './useReportOnly.ts';
import { useTab } from './useTab.ts';

// The way for the user to pick modules anywhere in the UI. It also shows the
// result when the graph can't (mobile, report-only), instead of doing nothing.
// `inspect` is for pickers that mean to look at the module, e.g. the graph.
export function useSelect({ inspect = false } = {}) {
  const setSelection = useGraphSelection()[2];
  const [, selectTab] = useTab();
  const [isReportOnly, , leaveReportOnly] = useReportOnly();
  const isTightScreen = useIsTightScreen();
  const [isGraphVisible, setGraphVisible] = useGlobalState('isGraphVisible');
  const isGraphShown = !isReportOnly && (!isTightScreen || isGraphVisible);

  return (type: QueryTypeValue, value: string) => {
    const count = queryModuleCache(type, value).size;

    // Where to look at a new selection so that picking it always has a visible effect.
    // The graph shows any selection, but only the Module tab shows a single module in detail.
    // `inspect`: the pick was meant to look at the module (e.g. a click in the graph), not just to highlight it
    const target =
      count === 1 && (inspect || !isGraphShown)
        ? 'module'
        : count > 1 && !isGraphShown
          ? 'graph'
          : undefined;

    const select = () => {
      setSelection(type, value);
      if (target === 'module') {
        selectTab(PaneType.MODULE);
      } else if (target === 'graph') {
        setGraphVisible(true);
      }
    };

    if (isReportOnly && target) {
      leaveReportOnly(select);
    } else {
      select();
    }
  };
}
