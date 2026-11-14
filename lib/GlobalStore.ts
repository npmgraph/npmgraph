import { useCallback, useSyncExternalStore } from 'react';
import type { GraphState } from './graph-types.ts';
import { PARAM_QUERY, PARAM_TAB, TIGHT_SCREEN_QUERY } from './constants.ts';
import type Module from './Module.ts';
import { hashGet, searchGet } from './url-util.ts';

type GlobalState = {
  colorize?: string;
  graph: GraphState;
  // On tight screens the graph and the inspector take turns
  isGraphVisible: boolean;
  // The module panel is docked under the report. It starts collapsed on tight screens, where it covers the page
  isModulePanelOpen: boolean;
  isReportPanelOpen: boolean;
  lastVisit: number;
  location: URL;
  selectedModules?: Map<string, Module>;
};

function _isGraphInitiallyVisible() {
  // A deep link to a tab shows that tab instead
  return (
    globalThis.window !== undefined &&
    globalThis.matchMedia(TIGHT_SCREEN_QUERY).matches &&
    Boolean(searchGet(PARAM_QUERY)) &&
    !hashGet(PARAM_TAB)
  );
}

let globalState: GlobalState = {
  graph: {
    moduleInfos: new Map(),
    entryModules: new Set(),
    failedEntryModules: new Map(),
  },
  isGraphVisible: _isGraphInitiallyVisible(),
  isModulePanelOpen:
    globalThis.window === undefined ||
    !globalThis.matchMedia(TIGHT_SCREEN_QUERY).matches,
  isReportPanelOpen: true,
  lastVisit: 0,
  location: new URL(location.href),
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
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Works as expected
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
    (value: GlobalState[T]) => {
      setGlobalState(key, value);
    },
    [key],
  );

  return [globalState[key], setValue];
}
