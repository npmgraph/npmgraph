import { lazy, Suspense, useDeferredValue, type HTMLProps } from 'react';
import { PaneType } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { cn } from '../lib/dom.ts';
import { useIsTightScreen } from '../hooks/useIsTightScreen.ts';
import useReportOnly from '../hooks/useReportOnly.ts';
import { useTab } from '../hooks/useTab.ts';
import ErrorsBox from './InfoPane/ErrorsBox.tsx';
import InfoPane from './InfoPane/InfoPane.tsx';
import * as styles from './Inspector.module.scss';
import ViewPane from './ViewPane/ViewPane.tsx';

// Keep these panes in secondary bundles but start loading them eagerly
const reportPanePromise = import('./ReportPane/ReportPane.tsx');
const modulePanePromise = import('./ModulePane/ModulePane.tsx');

const ReportPane = lazy(async () => reportPanePromise);
const ModulePane = lazy(async () => modulePanePromise);

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const { className, ...restProps } = props;
  const [tab] = useTab();
  const [isGraphVisible] = useGlobalState('isGraphVisible');
  const isTightScreen = useIsTightScreen();
  // The tab updates synchronously, so defer it to keep showing the previous one while the next suspends
  const deferredTab = useDeferredValue(tab);

  const [isReportOnly] = useReportOnly();

  // The graph is rendered by App, so it doesn't change when switching tabs
  if (
    !isReportOnly &&
    (tab === PaneType.NONE || (isTightScreen && isGraphVisible))
  ) {
    return null;
  }

  let paneComponent;
  switch (isReportOnly ? PaneType.REPORT : deferredTab) {
    case PaneType.MODULE:
      paneComponent = <ModulePane />;
      break;
    case PaneType.REPORT:
      paneComponent = <ReportPane />;
      break;
    case PaneType.VIEW:
      paneComponent = <ViewPane />;
      break;
    case PaneType.INFO:
      paneComponent = <InfoPane />;
      break;
    case PaneType.NONE:
      return null;
  }

  return (
    <div
      id="inspector"
      role="tabpanel"
      aria-labelledby={`tab-${isReportOnly ? PaneType.REPORT : deferredTab}`}
      className={cn(
        styles.inspector,
        { [styles.only]: isReportOnly },
        className,
      )}
      {...restProps}
    >
      {!isTightScreen && <ErrorsBox />}
      <Suspense fallback={null}>{paneComponent}</Suspense>
    </div>
  );
}
