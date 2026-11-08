import { useMemo } from 'react';
import {
  PaneType,
  PARAM_HIDE,
  PARAM_QUERY,
  PARAM_SECTION,
  PARAM_SELECTION,
  PARAM_TAB,
  type PaneTypes,
} from '../lib/constants.ts';
import {
  getGlobalState,
  setGlobalState,
  useGlobalState,
} from '../lib/GlobalStore.ts';
import type { GraphState } from '../lib/graph-types.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { hashGet, searchGet } from '../lib/url-util.ts';
import { parseSelection } from './useGraphSelection.ts';
import { isScreenTight, useIsTightScreen } from './useIsTightScreen.ts';
import { patchLocation } from './useLocation.ts';

type Tab = Exclude<PaneTypes, typeof PaneType.GRAPH>;

const tabs = new Set<string>([
  PaneType.INFO,
  PaneType.REPORT,
  PaneType.MODULE,
  PaneType.VIEW,
]);

function parseTab(value: string | null) {
  return value !== null && tabs.has(value) ? (value as Tab) : undefined;
}

// The tab shown when the URL doesn't specify one
function getDefaultTab(
  graph: GraphState,
  query: string | null,
  selection: string | null,
): Tab {
  if (
    !query ||
    (graph.entryModules.size === 0 && graph.failedEntryModules.size > 0)
  ) {
    return PaneType.INFO;
  }

  const [type, value] = parseSelection(selection);
  return queryModuleCache(type, value).size === 1
    ? PaneType.MODULE
    : PaneType.REPORT;
}

// The selected tab: the `tab` hash param, or else the default one. The graph
// is a tab only on tight screens, and it isn't stored in the URL.
export default function useTab(): PaneTypes {
  const [graph] = useGlobalState('graph');
  const [location] = useGlobalState('location');
  const [isGraphTabActive] = useGlobalState('isGraphTabActive');
  const isTightScreen = useIsTightScreen();

  const query = searchGet(PARAM_QUERY, location);
  const selection = hashGet(PARAM_SELECTION, location);
  const defaultTab = useMemo(
    () => getDefaultTab(graph, query, selection),
    [graph, query, selection],
  );

  return isTightScreen && isGraphTabActive
    ? PaneType.GRAPH
    : (parseTab(hashGet(PARAM_TAB, location)) ?? defaultTab);
}

// Select a tab and show the inspector. The default tab isn't stored in the URL.
export function selectTab(tab: PaneTypes) {
  // The graph isn't a tab on wide screens, so go back to the report
  if (tab === PaneType.GRAPH && !isScreenTight()) {
    tab = PaneType.REPORT;
  }

  setGlobalState('isGraphTabActive', tab === PaneType.GRAPH);

  const parameters = new URLSearchParams(location.hash.slice(1));
  const defaultTab = getDefaultTab(
    getGlobalState('graph'),
    searchGet(PARAM_QUERY),
    parameters.get(PARAM_SELECTION),
  );

  // Sections belong to a tab
  if (tab !== (parseTab(parameters.get(PARAM_TAB)) ?? defaultTab)) {
    parameters.delete(PARAM_SECTION);
  }

  if (tab === defaultTab || tab === PaneType.GRAPH) {
    parameters.delete(PARAM_TAB);
  } else {
    parameters.set(PARAM_TAB, tab);
  }

  parameters.delete(PARAM_HIDE);

  const hash = parameters.toString();
  if (hash !== location.hash.slice(1)) {
    patchLocation({ hash }, true);
  }
}
