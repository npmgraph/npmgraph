import { useEffect } from 'react';
import { PaneType } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useActivity } from '../../hooks/useActivity.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { useTightScreen } from '../../hooks/useTightScreen.ts';
import AppHeader from '../AppHeader.tsx';
import Flash from '../Flash/Flash.tsx';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import Inspector from '../Inspector.tsx';
import Intro from '../Intro.tsx';
import PreviewWidget from '../PreviewWidget.tsx';
import Tabs from '../ui/Tabs.tsx';
import useExternalInput from '../../hooks/useExternalInput.ts';
import * as styles from './App.module.scss';
import { Loader } from './Loader.tsx';

export default function App() {
  const activity = useActivity();
  const [query] = useQuery();
  const isTightScreen = useTightScreen();
  const [pane, setPane] = useGlobalState('pane');
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

  // On mobile the graph is a tab. It stays mounted when hidden, otherwise
  // it'd be laid out again every time the user comes back to it.
  const isGraphHidden = isTightScreen && pane !== PaneType.GRAPH;

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
          <div className={cn(styles.graph, { [styles.hidden]: isGraphHidden })}>
            <GraphDiagram activity={activity} />
          </div>
          <Inspector />
        </div>
        <PreviewWidget />
      </div>
    </>
  );
}
