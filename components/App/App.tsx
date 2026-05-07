import { useEffect, useRef } from 'react';
import { useActivity } from '../../lib/useActivity.ts';
import { PaneType } from '../../lib/constants.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useQuery } from '../../lib/useQuery.ts';
import { useTightScreen } from '../../lib/useTightScreen.ts';
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
  const isTightScreen = useTightScreen();
  const isTightScreenRef = useRef(isTightScreen);
  isTightScreenRef.current = isTightScreen;
  const [, setPane] = useGlobalState('pane');
  useExternalInput();

  // On mobile, auto-select the Graph tab whenever the query changes.
  // This handles both deep links (initial load) and new queries during a session.
  // isTightScreen is read via ref so viewport resizes don't trigger the effect.
  useEffect(() => {
    if (isTightScreenRef.current && query.length > 0) {
      setPane(PaneType.GRAPH);
    }
  }, [query, setPane]);

  if (query.length === 0) {
    return <Intro />;
  }

  return (
    <div className={styles.root}>
      <div className={styles.stickyTop}>
        <AppHeader />
        <Tabs className={styles.mobileTabs} />
      </div>
      {activity.total > 0 ? <Loader activity={activity} /> : null}
      <div className={styles.content}>
        {!isTightScreen ? <GraphDiagram activity={activity} /> : null}
        <Inspector activity={activity} />
      </div>
    </div>
  );
}
