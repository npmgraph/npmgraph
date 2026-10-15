import { lazy, Suspense, type HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { cn } from '../lib/dom.ts';
import useHashParam from '../hooks/useHashParam.ts';
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
  const [pane] = useGlobalState('pane');
  const [graph] = useGlobalState('graph');

  const [hide] = useHashParam(PARAM_HIDE);

  if (hide !== null) {
    return null;
  }

  let paneComponent;
  switch (pane) {
    case PaneType.MODULE:
      paneComponent = <ModulePane />;
      break;
    case PaneType.REPORT:
      paneComponent = <ReportPane graph={graph} />;
      break;
    case PaneType.GRAPH:
      // The graph is rendered by App, so it doesn't change when switching tabs
      return null;
    case PaneType.VIEW:
      paneComponent = <ViewPane />;
      break;
    case PaneType.INFO:
      paneComponent = <InfoPane />;
      break;
  }

  return (
    <div className={cn(styles.inspector, className)} {...restProps}>
      <Suspense fallback={null}>{paneComponent}</Suspense>
    </div>
  );
}
