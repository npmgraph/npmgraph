import {
  PaneType,
  PARAM_HIDE,
  PARAM_SECTION,
  PARAM_TAB,
  type PaneTypes,
} from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import useHashParam from './useHashParam.ts';
import { useIsTightScreen } from './useIsTightScreen.ts';
import { patchHash } from './useLocation.ts';
import { useQuery } from './useQuery.ts';

const tabs = new Set<string>([
  PaneType.REPORT,
  PaneType.MODULE,
  PaneType.VIEW,
  PaneType.NONE,
]);

// The tab to show until the user picks one
function useDefaultTab(): PaneTypes {
  const [query] = useQuery();
  return query.length === 0 ? PaneType.INFO : PaneType.REPORT;
}

// The `tab` hash param stores the user's tab. Without it, the tab follows the default.
export function useTab() {
  const [tabParameter] = useHashParam(PARAM_TAB);
  const [isInfoOpen, setInfoOpen] = useGlobalState('isInfoOpen');
  const [, setGraphVisible] = useGlobalState('isGraphVisible');
  const isTightScreen = useIsTightScreen();
  const defaultTab = useDefaultTab();
  // The info tab is hidden on tight screens
  const tab =
    isInfoOpen && !isTightScreen
      ? PaneType.INFO
      : tabParameter !== null && tabs.has(tabParameter)
        ? (tabParameter as PaneTypes)
        : defaultTab;

  // Show a tab (`null` goes back to the default one): leave the report-only view, leave the mobile graph and drop the section of the previous tab
  // `PaneType.NONE` closes the inspector instead, and leaves the graph alone
  const selectTab = (nextTab: PaneTypes | null) => {
    patchHash(parameters => {
      if (nextTab === null) {
        parameters.delete(PARAM_TAB);
      } else if (nextTab !== PaneType.INFO) {
        parameters.set(PARAM_TAB, nextTab);
      }

      parameters.delete(PARAM_HIDE);
      if (nextTab !== tab) {
        parameters.delete(PARAM_SECTION);
      }
    });
    setInfoOpen(nextTab === PaneType.INFO);
    if (nextTab !== PaneType.NONE) {
      setGraphVisible(false);
    }
  };

  return [tab, selectTab] as const;
}
