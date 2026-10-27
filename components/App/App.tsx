import { useEffect } from 'react';
import { PaneType, PARAM_ONLY } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import useHashParam from '../../hooks/useHashParam.ts';
import { useActivity } from '../../hooks/useActivity.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';
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
  const isTightScreen = useIsTightScreen();
  const [pane, setPane] = useGlobalState('pane');
  const [only] = useHashParam(PARAM_ONLY);
  const isReportOnly = only === 'report';
  useExternalInput();

  // On mobile, auto-select the Graph tab whenever the query changes.
  // This handles both deep links (initial load) and new queries during a session.
  useEffect(() => {
    if (isReportOnly) {
      setPane(PaneType.REPORT);
    } else if (isTightScreen && query.length > 0) {
      setPane(PaneType.GRAPH);
    }
  }, [query, isTightScreen, isReportOnly, setPane]);

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
  const isGraphHidden =
    isReportOnly || (isTightScreen && pane !== PaneType.GRAPH);

  return (
    <>
      <Flash />
      <div
        className={cn(styles.root, {
          [styles.loading]: activity.total > 0,
          [styles.fixedHeight]: isTightScreen && pane === PaneType.GRAPH,
        })}
      >
        <div className={styles.stickyTop}>
          <AppHeader />
          {(isTightScreen || isReportOnly) && <Tabs />}
        </div>
        {activity.total > 0 ? <Loader activity={activity} /> : null}
        <div className={styles.content}>
          <div className={styles.graph} hidden={isGraphHidden}>
            <GraphDiagram activity={activity} />
          </div>
          <Inspector />
        </div>
        <PreviewWidget />
      </div>
    </>
  );
}
