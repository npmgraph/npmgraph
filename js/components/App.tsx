import React, { useState } from 'react';
import GraphDiagram from '../graphdiagram/GraphDiagram.js';
import { GraphState } from '../graphdiagram/graph_util.js';
import LoadActivity from '../util/LoadActivity.js';
import sharedStateHook from '../util/sharedStateHook.js';
import useHashParam from '../util/useHashParam.js';
import useSearchParam from '../util/useSearchParam.js';
import Inspector from './Inspector.js';
import { Loader } from './Loader.js';
import { Splitter } from './Splitter.js';
import '/css/App.scss';

export const [usePane] = sharedStateHook('info', 'pane');
export const [useGraph] = sharedStateHook(null as GraphState | null, 'graph');
export const [useExcludes] = sharedStateHook([] as string[], 'excludes');

export function useQuery() {
  const [queryString, setQueryString] = useSearchParam('q');
  const moduleKeys = queryString.split(/[, ]+/).filter(Boolean);
  return [
    moduleKeys,
    function setQuery(moduleKeys: string[] = []) {
      setQueryString(moduleKeys.join(','), true);
    },
  ] as const;
}

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
