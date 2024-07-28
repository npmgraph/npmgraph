import { useSyncExternalStore } from 'react';
import type { GraphState } from '../components/GraphDiagram/graph_util.js';
import { PANE } from '../components/Inspector.js';
import type Module from './Module.js';
import type { GithubCommit } from './fetch_types.js';
import { hashGet, searchGet } from './url_util.js';

interface GlobalState {
  colorize?: string
  graph: GraphState
  lastVisit: number
  location: URL
  pane: PANE
  selectedModules?: Map<string, Module>
  commits: GithubCommit[]
}

function _getInitialPane() {
  if (!searchGet('q')) {
    return PANE.INFO;
  }
  const select = hashGet('select')?.split(/[, ]+/);
  return select ? PANE.MODULE : PANE.GRAPH;
}

let globalState: GlobalState = {
  commits: [],
  graph: {
    moduleInfos: new Map(),
    entryModules: new Set(),
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

export function setGlobalState<T extends keyof GlobalState>(
  key: T,
  value: GlobalState[T],
) {
  const current = globalState[key];
  if (value instanceof URL || value instanceof Location) {
    if (String(value) === String(current)) {
      return;
    }
  }
  else if (globalState[key] === value) {
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

  function setValue(value: GlobalState[T]) {
    setGlobalState(key, value);
  }

  return [globalState[key], setValue];
}
