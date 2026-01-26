import { useActivity } from '../../lib/useActivity.ts';
import { useQuery } from '../../lib/useQuery.ts';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import Inspector from '../Inspector.tsx';
import Intro from '../Intro.tsx';
import './App.scss';
import { Loader } from './Loader.tsx';

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
