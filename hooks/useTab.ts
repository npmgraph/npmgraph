import { useMemo } from 'react';
import {
  PaneType,
  PARAM_HIDE,
  PARAM_SECTION,
  PARAM_TAB,
  type PaneTypes,
} from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import useGraphSelection from './useGraphSelection.ts';
import { patchLocation } from './useLocation.ts';
import { useQuery } from './useQuery.ts';
import useHashParam from './useHashParam.ts';

const tabs = new Set<string>(Object.values(PaneType));

// The tab to show until the user picks one, based on the graph
function useDefaultTab(): PaneTypes {
  const [query] = useQuery();
  const [graph] = useGlobalState('graph');
  const [selectType, selectValue] = useGraphSelection();
  const nSelected = useMemo(
    () => queryModuleCache(selectType, selectValue).size,
    // Selection depends on the graph's modules
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, selectType, selectValue],
  );

  if (query.length === 0) {
    return PaneType.INFO;
  }

  return nSelected === 1 ? PaneType.MODULE : PaneType.REPORT;
}

// The `tab` hash param is the only place where the user's tab is stored.
// Without it, the tab follows the default.
export function useTab() {
  const [tabParameter] = useHashParam(PARAM_TAB);
  const [, setGraphVisible] = useGlobalState('isGraphVisible');
  const defaultTab = useDefaultTab();
  const tab =
    tabParameter !== null && tabs.has(tabParameter)
      ? (tabParameter as PaneTypes)
      : defaultTab;

  // Show a tab: un-hide the inspector, leave the mobile graph and drop the section of the previous tab
  const selectTab = (nextTab: PaneTypes) => {
    const parameters = new URLSearchParams(location.hash.slice(1));
    parameters.set(PARAM_TAB, nextTab);
    parameters.delete(PARAM_HIDE);
    if (nextTab !== tab) {
      parameters.delete(PARAM_SECTION);
    }

    patchLocation({ hash: parameters.toString() }, true);
    setGraphVisible(false);
  };

  return [tab, selectTab] as const;
}
