import React, { useState, useEffect } from 'react';
import Inspector from './Inspector';
import Graph from './Graph';
import { LoadActivity } from './util';
import Store from './Store';
import { Loader } from './Components';
import sharedStateHook from './sharedStateHook';

import '/css/App.scss';

export const usePane = sharedStateHook('info', 'pane');
export const useInspectorOpen = sharedStateHook(true, 'inspectorOpen');
export const useQuery = sharedStateHook(queryFromLocation(), 'query');
export const useModule = sharedStateHook([], 'module');
export const useGraph = sharedStateHook([], 'graph');
export const useColorize = sharedStateHook(false, 'colorize');
export const useDepIncludes = sharedStateHook(['dependencies'], 'depIncludes');

function Splitter({ onClick, isOpen }) {
  return <div id='splitter' className='theme-dark bright-hover' onClick={onClick}>{isOpen ? '\u{25b6}' : '\u{25c0}'}</div>;
}

// Parse url query param from browser location, "q"
function queryFromLocation() {
  const q = /q=([^&]+)/.test(location.search) && RegExp.$1;
  return q ? decodeURIComponent(q).split(/\s*,\s*/) : [];
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

  return <>
    {activity.total > 0 ? <Loader activity={activity} /> : null}
    <Graph />
    <Splitter isOpen={inspectorOpen} onClick={() => setInspectorOpen(!inspectorOpen)} />
    <Inspector className={inspectorOpen ? 'open' : ''} />
  </>;
}
