import { lazy, Suspense, useDeferredValue, type HTMLProps } from 'react';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { cn } from '../lib/dom.ts';
import useHashParam from '../hooks/useHashParam.ts';
import { useIsTightScreen } from '../hooks/useIsTightScreen.ts';
import useReportOnly from '../hooks/useReportOnly.ts';
import useGraphSelection from '../hooks/useGraphSelection.ts';
import { useQuery } from '../hooks/useQuery.ts';
import { useTab } from '../hooks/useTab.ts';
import { useTabScroll } from '../hooks/useTabScroll.ts';
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

  const [hide] = useHashParam(PARAM_HIDE);
  const [isReportOnly] = useReportOnly();
  const [query] = useQuery();
  const [selectionType, selectionValue] = useGraphSelection();

  // The graph is rendered by App, so it doesn't change when switching tabs
  const isHidden =
    !isReportOnly && (hide !== null || (isTightScreen && isGraphVisible));
  const shownTab = isReportOnly ? PaneType.REPORT : deferredTab;

  // The scroll position only makes sense for the same content
  const content = query.join(',');
  useTabScroll(
    shownTab,
    shownTab === PaneType.MODULE
      ? `${content}|${selectionType}:${selectionValue}`
      : shownTab === PaneType.REPORT
        ? content
        : '',
    isTightScreen,
    !isHidden,
  );

  if (isHidden) {
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
