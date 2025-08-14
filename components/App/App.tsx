import { useActivity } from '../../lib/useActivity.js';
import { useQuery } from '../../lib/useQuery.js';
import GraphDiagram from '../GraphDiagram/GraphDiagram.js';
import Inspector from '../Inspector.js';
import Intro from '../Intro.js';
import './App.scss';
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
