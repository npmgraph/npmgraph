import React, { useEffect, useState } from 'react';
import { Loader } from './components/Loader.js';
import Graph from './Graph.js';
import Inspector from './Inspector.js';
import sharedStateHook from './sharedStateHook.js';
import Store from './Store.js';
import { GraphState } from './types.js';
import { LoadActivity } from './util.js';
import '/css/App.scss';
import Module from './Module.js';

export const usePane = sharedStateHook('info', 'pane');
export const useInspectorOpen = sharedStateHook(true, 'inspectorOpen');
export const useQuery = sharedStateHook(queryFromLocation(), 'query');
export const useModule = sharedStateHook(
  undefined as Module | undefined,
  'module',
);
export const useGraph = sharedStateHook(null as GraphState | null, 'graph');
export const useColorize = sharedStateHook('', 'colorize');
export const useIncludeDev = sharedStateHook(false, 'includeDev');
export const useExcludes = sharedStateHook([] as string[], 'excludes');

function Splitter({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <div id="splitter" className="bright-hover" onClick={onClick}>
      {isOpen ? '\u{25b6}' : '\u{25c0}'}
    </div>
  );
}

// Parse `q` query param from browser location
function queryFromLocation() {
  const q = new URL(location.href).searchParams.get('q');
  return (q ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

export const activity = new LoadActivity();
export const store = new Store(activity);
export function useActivity() {
  const [bool, setBool] = useState(true);
  activity.onChange = () => setBool(!bool);
  return activity;
}

export default function App() {
  const activity = useActivity();
  const [, setQuery] = useQuery();

  useEffect(() => {
    function handlePopState() {
      setQuery(queryFromLocation());
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [inspectorOpen, setInspectorOpen] = useInspectorOpen();

  return (
    <>
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <Graph />
      <Splitter
        isOpen={inspectorOpen}
        onClick={() => setInspectorOpen(!inspectorOpen)}
      />
      <Inspector className={inspectorOpen ? 'open' : ''} />
    </>
  );
}
