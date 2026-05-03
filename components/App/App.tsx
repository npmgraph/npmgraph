import { useActivity } from '../../lib/useActivity.ts';
import { useQuery } from '../../lib/useQuery.ts';
import AppHeader from '../AppHeader.tsx';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import Inspector from '../Inspector.tsx';
import Intro from '../Intro.tsx';
import useExternalInput from '../useExternalInput.ts';
import * as styles from './App.module.scss';
import { Loader } from './Loader.tsx';
import { PARAM_HIDE } from '../../lib/constants.ts';
import useHashParam from '../../lib/useHashParam.ts';

export default function App() {
  const activity = useActivity();
  const [query] = useQuery();
  useExternalInput();

  const [hiddenSidebar] = useHashParam(PARAM_HIDE);

  if (query.length === 0) {
    return <Intro />;
  }

  return (
<>
    {activity.total > 0 ? <Loader activity={activity} /> : null}
    <div className={styles.root}>
      <AppHeader className={styles.header} />
      <GraphDiagram className={styles.graph} activity={activity} />
      {hiddenSidebar ? null : <Inspector className={styles.inspector} />}
    </div>
</>
  );
}
