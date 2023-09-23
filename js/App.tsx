import React, { useEffect, useState } from 'react';
import Graph from './Graph.js';
import Inspector from './Inspector.js';
import Module from './Module.js';
import { Loader } from './components/Loader.js';
import sharedStateHook from './sharedStateHook.js';
import { GraphState } from './types.js';
import LoadActivity from './util/LoadActivity.js';
import '/css/App.scss';

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

let activity: LoadActivity;
export function setActivityForApp(ack: LoadActivity) {
  activity = ack;
}

export function useActivity() {
  const [bool, setBool] = useState(true);
  if (!activity) throw new Error('Activity not set');
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
      <Graph activity={activity} />
      <Splitter
        isOpen={inspectorOpen}
        onClick={() => setInspectorOpen(!inspectorOpen)}
      />
      <Inspector className={inspectorOpen ? 'open' : ''} />
    </>
  );
}
