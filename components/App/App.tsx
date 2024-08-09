import { useState } from 'react';
import type LoadActivity from '../../lib/LoadActivity.js';
import GraphDiagram from '../GraphDiagram/GraphDiagram.js';
import Inspector from '../Inspector.js';
import './App.scss';
import { useQuery } from '../../lib/useQuery.js';
import Intro from '../Intro.js';
import { Loader } from './Loader.js';

export default function App() {
  const activity = useActivity();
  const [query] = useQuery();
  if (query.length === 0) {
    return <Intro />;
  }

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
