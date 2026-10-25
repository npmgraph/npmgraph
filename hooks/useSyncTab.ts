import { useEffect, useMemo, useRef } from 'react';
import type { GraphState } from '../lib/graph-types.ts';
import {
  PaneType,
  PARAM_SECTION,
  PARAM_TAB,
  type PaneTypes,
} from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import useGraphSelection from './useGraphSelection.ts';
import { useQuery } from './useQuery.ts';
import { patchLocation } from './useLocation.ts';

const TAB_PANES = new Set<string>([
  PaneType.INFO,
  PaneType.REPORT,
  PaneType.MODULE,
  PaneType.VIEW,
]);

function hasTabParameter() {
  const tab = new URLSearchParams(location.hash.slice(1)).get(PARAM_TAB);
  return tab !== null && TAB_PANES.has(tab);
}

function patchHash(updates: Record<string, string | null>) {
  const parameters = new URLSearchParams(location.hash.slice(1));
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      parameters.delete(key);
    } else {
      parameters.set(key, value);
    }
  }

  const hash = parameters.toString();
  if (hash !== location.hash.slice(1)) {
    patchLocation({ hash }, true);
  }
}

// Keep the `tab` hash param and the current pane in sync.
//
// Each graph state has a default pane, which is represented by the absence of
// the `tab` param:
// - Empty graph: info
// - Exactly one module selected: module
// - Otherwise: report
export default function useSyncTab() {
  const [query] = useQuery();
  const [pane, setPane] = useGlobalState('pane');
  const [graph] = useGlobalState('graph');
  const [selectType, selectValue] = useGraphSelection();

  const queryKey = query.join(',');
  const nSelected = useMemo(
    () => queryModuleCache(selectType, selectValue).size,
    // Selection depends on the graph's modules
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, selectType, selectValue],
  );

  let defaultPane: PaneTypes = PaneType.REPORT;
  if (graph.entryModules.size === 0) {
    defaultPane = PaneType.INFO;
  } else if (nSelected === 1) {
    defaultPane = PaneType.MODULE;
  }

  const stateRef = useRef({
    queryKey: null as string | null,
    graph: undefined as GraphState | undefined,
    isPending: true,
    pane,
    defaultPane,
  });

  useEffect(() => {
    const state = stateRef.current;

    if (queryKey === '') {
      state.queryKey = null;
      return;
    }

    // New query: wait for its graph to load before syncing
    if (queryKey !== state.queryKey) {
      state.queryKey = queryKey;
      state.graph = graph;
      state.isPending = true;
      state.pane = pane;
      state.defaultPane = defaultPane;
      return;
    }

    if (state.isPending) {
      if (graph === state.graph) {
        return;
      }

      state.isPending = false;
      const wasPaneChanged = pane !== state.pane;
      state.defaultPane = defaultPane;
      state.pane = pane;

      // Page load: show the default tab unless the URL specifies one
      if (!wasPaneChanged && pane !== PaneType.GRAPH && !hasTabParameter()) {
        setPane(defaultPane);
        state.pane = defaultPane;
        return;
      }
    }

    // The mobile graph tab is not stored
    if (pane === PaneType.GRAPH) {
      state.pane = pane;
      state.defaultPane = defaultPane;
      patchHash({ [PARAM_TAB]: null });
      return;
    }

    // Without an explicit tab, follow the default as the graph state changes
    if (defaultPane !== state.defaultPane && !hasTabParameter()) {
      state.defaultPane = defaultPane;
      state.pane = defaultPane;
      if (pane !== defaultPane) {
        setPane(defaultPane);
      }

      return;
    }

    state.defaultPane = defaultPane;

    // Sections belong to a tab, so drop the section when the tab changes
    const updates: Record<string, string | null> = {
      [PARAM_TAB]: pane === defaultPane ? null : pane,
    };
    if (pane !== state.pane) {
      updates[PARAM_SECTION] = null;
    }

    state.pane = pane;
    patchHash(updates);
  }, [queryKey, graph, pane, defaultPane, setPane]);
}
