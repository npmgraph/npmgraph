import { useSpinDelay } from 'spin-delay';
import { useActivity } from '../../lib/useActivity.ts';
import { useQuery } from '../../lib/useQuery.ts';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import Inspector from '../Inspector.tsx';
import Intro from '../Intro.tsx';
import useExternalInput from '../useExternalInput.ts';
import './App.scss';
import { Loader } from './Loader.tsx';

export default function App() {
  const activity = useActivity();
  const [query] = useQuery();
  useExternalInput();
  const showLoader = useSpinDelay(activity.total > 0, {
    delay: 0,
    minDuration: 300,
  });
  if (query.length === 0) {
    return <Intro />;
  }

  return (
    <>
      {showLoader ? <Loader activity={activity} /> : null}
      <GraphDiagram activity={activity} />
      <Inspector />
    </>
  );
}
