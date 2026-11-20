import { PaneType } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache, type QueryTypeValue } from '../lib/ModuleCache.ts';
import { getSelectionTarget } from '../lib/selection-util.ts';
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
    const target = getSelectionTarget({
      count: queryModuleCache(type, value).size,
      isGraphShown,
      inspect,
    });

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
