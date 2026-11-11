import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import {
  PaneType,
  PARAM_HIDE,
  PARAM_SECTION,
  PARAM_TAB,
  type PaneTypes,
} from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { useQuery } from './useQuery.ts';

const tabs = Object.values(PaneType);

// The tab to show until the user picks one
function useDefaultTab(): PaneTypes {
  const [query] = useQuery();
  return query.length === 0 ? PaneType.INFO : PaneType.REPORT;
}

// The `tab` hash param is the only place where the user's tab is stored.
// Without it, the tab follows the default.
export function useTab() {
  const [parameters, setParameters] = useQueryStates({
    [PARAM_TAB]: parseAsStringEnum<PaneTypes>(tabs),
    [PARAM_HIDE]: parseAsString,
    [PARAM_SECTION]: parseAsString,
  });
  const [, setGraphVisible] = useGlobalState('isGraphVisible');
  const defaultTab = useDefaultTab();
  const tab = parameters[PARAM_TAB] ?? defaultTab;

  // Show a tab: un-hide the inspector, leave the mobile graph and drop the section of the previous tab
  const selectTab = (nextTab: PaneTypes) => {
    void setParameters({
      [PARAM_TAB]: nextTab,
      [PARAM_HIDE]: null,
      ...(nextTab !== tab && { [PARAM_SECTION]: null }),
    });
    setGraphVisible(false);
  };

  return [tab, selectTab] as const;
}
