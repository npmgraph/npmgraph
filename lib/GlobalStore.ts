import { useCallback, useSyncExternalStore } from 'react';
import type { GraphState } from '../components/GraphDiagram/graph_util.ts';
import type { PaneTypes } from './constants.ts';
import { PaneType, PARAM_QUERY } from './constants.ts';
import type Module from './Module.ts';
import { hashGet, searchGet } from './url_util.ts';

type GlobalState = {
  colorize?: string;
  graph: GraphState;
  lastVisit: number;
  location: URL;
  pane: PaneTypes;
  selectedModules?: Map<string, Module>;
};

import { TIGHT_SCREEN_QUERY } from './useTightScreen.ts';

function _getInitialPane() {
  if (!searchGet(PARAM_QUERY)) {
    return PaneType.INFO;
  }
  const select = hashGet('select')?.split(/[, ]+/);
  if (select) return PaneType.MODULE;
  const isTight =
    typeof window !== 'undefined' &&
    window.matchMedia(TIGHT_SCREEN_QUERY).matches;
  return isTight ? PaneType.GRAPH : PaneType.REPORT;
}

let globalState: GlobalState = {
  graph: {
    moduleInfos: new Map(),
    entryModules: new Set(),
    failedEntryModules: new Map(),
  },
  lastVisit: 0,
  location: new URL(location.href),
  pane: _getInitialPane(),
  selectedModules: new Map(),
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return globalState;
}

export function getGlobalState<T extends keyof GlobalState>(
  key: T,
): GlobalState[T] {
  return globalState[key];
}

export function setGlobalState<T extends keyof GlobalState>(
  key: T,
  value: GlobalState[T],
) {
  const current = globalState[key];
  if (value instanceof URL || value instanceof Location) {
    if (String(value) === String(current)) {
      return;
    }
  } else if (globalState[key] === value) {
    return;
  }

  globalState = { ...globalState, [key]: value };
  for (const listener of listeners) {
    listener();
  }
}

export function useGlobalState<T extends keyof GlobalState>(
  key: T,
): [GlobalState[T], (value: GlobalState[T]) => void] {
  const globalState = useSyncExternalStore(subscribe, getSnapshot);

  const setValue = useCallback(
    (value: GlobalState[T]) => setGlobalState(key, value),
    [key],
  );

  return [globalState[key], setValue];
}
