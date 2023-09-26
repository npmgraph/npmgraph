import React, { useState } from 'react';
import LoadActivity from '../lib/LoadActivity.js';
import sharedStateHook from '../lib/sharedStateHook.js';
import useHashParam from '../lib/useHashParam.js';
import useSearchParam from '../lib/useSearchParam.js';
import './App.scss';
import GraphDiagram from './GraphDiagram/GraphDiagram.js';
import { GraphState } from './GraphDiagram/graph_util.js';
import Inspector from './Inspector.js';
import { Loader } from './Loader.js';
import { Splitter } from './Splitter.js';

export const [usePane] = sharedStateHook('info', 'pane');
export const [useGraph] = sharedStateHook(null as GraphState | null, 'graph');
export const [useExcludes] = sharedStateHook([] as string[], 'excludes');

export default function App() {
  const activity = useActivity();
  const [zenMode, setZenMode] = useHashParam('zen');

  return (
    <>
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <GraphDiagram activity={activity} />
      <Splitter
        isOpen={!zenMode}
        onClick={() => setZenMode(zenMode ? '' : '1')}
      />
      <Inspector className={zenMode ? '' : 'open'} />
    </>
  );
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

export function useQuery() {
  const [queryString, setQueryString] = useSearchParam('q');
  const moduleKeys = queryString.split(/[, ]+/).filter(Boolean);
  return [
    moduleKeys,
    function setQuery(moduleKeys: string[] = []) {
      // Clean up keys
      moduleKeys = moduleKeys.filter(Boolean).map(key => {
        key = key.trim();

        // Don't lowercase URLs
        if (/https?:\/\//i.test(key)) return key;

        return key.toLowerCase();
      });
      moduleKeys = [...new Set(moduleKeys)];
      setQueryString(moduleKeys.join(','), true);
    },
  ] as const;
}
