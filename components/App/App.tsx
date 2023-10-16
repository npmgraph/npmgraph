import React, { useState } from 'react';
import LoadActivity from '../../lib/LoadActivity.js';
import sharedStateHook from '../../lib/sharedStateHook.js';
import GraphDiagram from '../GraphDiagram/GraphDiagram.js';
import { GraphState } from '../GraphDiagram/graph_util.js';
import Inspector from '../Inspector.js';
import './App.scss';
import { Loader } from './Loader.js';

export const [usePane] = sharedStateHook('info', 'pane');
export const [useGraph] = sharedStateHook(null as GraphState | null, 'graph');

export default function App() {
  const activity = useActivity();
  return (
    <>
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <GraphDiagram activity={activity} />
      <Inspector />
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
