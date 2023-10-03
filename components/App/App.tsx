import React, { useState } from 'react';
import LoadActivity from '../../lib/LoadActivity.js';
import { PARAM_VIEW_MODE, VIEW_MODE_CLOSED } from '../../lib/constants.js';
import sharedStateHook from '../../lib/sharedStateHook.js';
import useHashParam from '../../lib/useHashParam.js';
import GraphDiagram from '../GraphDiagram/GraphDiagram.js';
import { GraphState } from '../GraphDiagram/graph_util.js';
import { Splitter } from './../Splitter.js';
import './App.scss';
import Inspector from './Inspector.js';
import { Loader } from './Loader.js';

export const [usePane] = sharedStateHook('info', 'pane');
export const [useGraph] = sharedStateHook(null as GraphState | null, 'graph');
export const [useExcludes] = sharedStateHook([] as string[], 'excludes');

export default function App() {
  const activity = useActivity();
  const [viewMode, setViewMode] = useHashParam(PARAM_VIEW_MODE);

  const isOpen = viewMode != VIEW_MODE_CLOSED;

  return (
    <>
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <GraphDiagram activity={activity} />
      <Splitter
        isOpen={isOpen}
        onClick={() => setViewMode(isOpen ? VIEW_MODE_CLOSED : '')}
      />
      <Inspector className={viewMode ? '' : 'open'} />
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
