import { useActivity } from '../../lib/useActivity.ts';
import { useQuery } from '../../lib/useQuery.ts';
import AppHeader from '../AppHeader.tsx';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import Inspector from '../Inspector.tsx';
import Intro from '../Intro.tsx';
import Tabs from '../Tabs.tsx';
import useExternalInput from '../useExternalInput.ts';
import * as styles from './App.module.scss';
import { Loader } from './Loader.tsx';

export default function App() {
  const activity = useActivity();
  const [query] = useQuery();
  useExternalInput();

  if (query.length === 0) {
    return <Intro />;
  }

  return (
    <div className={styles.root}>
      <AppHeader />
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <div className={styles.content}>
        <GraphDiagram activity={activity} />
        <Tabs className="mobile-tabs" />
        <Inspector />
      </div>
    </div>
  );
}
