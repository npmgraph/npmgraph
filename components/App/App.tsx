import { useEffect, useRef } from 'react';
import { PaneType } from '../../lib/constants.ts';
import { cn } from '../../lib/dom.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useActivity } from '../../hooks/useActivity.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import useTab from '../../hooks/useTab.ts';
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
  const pane = useTab();
  const [, setIsGraphTabActive] = useGlobalState('isGraphTabActive');
  const [isReportOnly] = useReportOnly();
  useExternalInput();

  // On mobile, show the graph whenever the query changes. The initial one is
  // handled by the global state, since a deep link can specify a tab.
  const queryKey = query.join(',');
  const queryKeyRef = useRef(queryKey);
  useEffect(() => {
    if (queryKeyRef.current === queryKey) {
      return;
    }

    queryKeyRef.current = queryKey;
    if (isTightScreen && queryKey) {
      setIsGraphTabActive(true);
    }
  }, [queryKey, isTightScreen, setIsGraphTabActive]);

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
          [styles.fixedHeight]:
            isTightScreen && pane === PaneType.GRAPH && !isReportOnly,
        })}
      >
        <div className={styles.stickyTop}>
          <AppHeader />
          {isTightScreen && <Tabs />}
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
