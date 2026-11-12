import { useEffect, useRef } from 'react';
import { cn } from '../../lib/dom.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { useActivity } from '../../hooks/useActivity.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { useQuery } from '../../hooks/useQuery.ts';
import { useIsTightScreen } from '../../hooks/useIsTightScreen.ts';
import AppHeader from '../AppHeader.tsx';
import Flash from '../Flash/Flash.tsx';
import GraphDiagram from '../GraphDiagram/GraphDiagram.tsx';
import ErrorsBox from '../InfoPane/ErrorsBox.tsx';
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
  const [isGraphVisible, setGraphVisible] = useGlobalState('isGraphVisible');
  const [isReportOnly] = useReportOnly();
  useExternalInput();

  // On mobile, show the graph when the query changes. The initial query is
  // handled by the initial state, which respects deep links to a tab.
  const queryKey = query.join(',');
  const previousQueryKeyRef = useRef(queryKey);
  useEffect(() => {
    if (previousQueryKeyRef.current === queryKey) {
      return;
    }

    previousQueryKeyRef.current = queryKey;
    if (isTightScreen && queryKey !== '') {
      setGraphVisible(true);
    }
  }, [queryKey, isTightScreen, setGraphVisible]);

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
  const isGraphHidden = isReportOnly || (isTightScreen && !isGraphVisible);

  return (
    <>
      <Flash />
      <div
        className={cn(styles.root, {
          [styles.loading]: activity.total > 0,
          [styles.fixedHeight]:
            isTightScreen && isGraphVisible && !isReportOnly,
        })}
      >
        <div className={styles.stickyTop}>
          <AppHeader />
          {isTightScreen && <Tabs />}
        </div>
        {/* On tight screens the inspector can be hidden, the errors can't */}
        {isTightScreen && <ErrorsBox />}
        {activity.total > 0 ? <Loader activity={activity} /> : null}
        <main className={styles.content}>
          <div className={styles.graph} hidden={isGraphHidden}>
            <GraphDiagram activity={activity} />
          </div>
          <Inspector />
        </main>
        <PreviewWidget />
      </div>
    </>
  );
}
