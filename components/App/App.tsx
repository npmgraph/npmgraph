import { useEffect } from 'react';
import { PaneType } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useActivity } from '../../lib/useActivity.ts';
import { useQuery } from '../../lib/useQuery.ts';
import { useTightScreen } from '../../lib/useTightScreen.ts';
import AppHeader from '../AppHeader.tsx';
import Flash from '../Flash/Flash.tsx';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import Inspector from '../Inspector.tsx';
import Intro from '../Intro.tsx';
import PreviewWidget from '../PreviewWidget.tsx';
import Tabs from '../Tabs.tsx';
import useExternalInput from '../useExternalInput.ts';
import * as styles from './App.module.scss';
import { Loader } from './Loader.tsx';

export default function App() {
  const activity = useActivity();
  const [query] = useQuery();
  const isTightScreen = useTightScreen();
  const [, setPane] = useGlobalState('pane');
  useExternalInput();

  // On mobile, auto-select the Graph tab whenever the query changes.
  // This handles both deep links (initial load) and new queries during a session.
  useEffect(() => {
    if (isTightScreen && query.length > 0) {
      setPane(PaneType.GRAPH);
    }
  }, [query, isTightScreen, setPane]);

  if (query.length === 0) {
    return (
      <>
        <Flash />
        <Intro />
        <PreviewWidget />
      </>
    );
  }

  return (
    <>
      <Flash />
      <div className={styles.root}>
        <div className={styles.stickyTop}>
          <AppHeader />
          <Tabs className={styles.mobileTabs} />
        </div>
        {activity.total > 0 ? <Loader activity={activity} /> : null}
        <div className={styles.content}>
          {isTightScreen ? null : <GraphDiagram activity={activity} />}
          <Inspector activity={activity} />
        </div>
        <PreviewWidget />
      </div>
    </>
  );
}
