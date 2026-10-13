import { lazy, Suspense, type HTMLProps } from 'react';
import useGraphSelection from '../hooks/useGraphSelection.ts';
import useHashParam from '../hooks/useHashParam.ts';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { cn } from '../lib/dom.ts';
import { importWithDiagnostics } from '../lib/importWithDiagnostics.ts';
import InfoPane from './InfoPane/InfoPane.tsx';
import * as styles from './Inspector.module.scss';
import SettingsPane from './SettingsPane/SettingsPane.tsx';

const loadReportPane = async () =>
  importWithDiagnostics(
    'ReportPane',
    async () => import('./ReportPane/ReportPane.tsx'),
  );
const loadModulePane = async () =>
  importWithDiagnostics(
    'ModulePane',
    async () => import('./ModulePane/ModulePane.tsx'),
  );

// Keep these panes in secondary bundles but start loading them eagerly.
// A failed prefetch is swallowed; lazy() re-imports on first render.
const reportPanePrefetch = loadReportPane().catch(() => {});
const modulePanePrefetch = loadModulePane().catch(() => {});

const ReportPane = lazy(async () => {
  await reportPanePrefetch;
  return loadReportPane();
});
const ModulePane = lazy(async () => {
  await modulePanePrefetch;
  return loadModulePane();
});

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const { className, ...restProps } = props;
  const [pane] = useGlobalState('pane');
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGlobalState('graph');

  const [hide] = useHashParam(PARAM_HIDE);

  if (hide !== null) {
    return null;
  }

  const selectedModules = queryModuleCache(queryType, queryValue);

  let paneComponent;
  switch (pane) {
    case PaneType.MODULE:
      paneComponent = <ModulePane selectedModules={selectedModules} />;
      break;
    case PaneType.REPORT:
      paneComponent = <ReportPane graph={graph} />;
      break;
    case PaneType.GRAPH:
      // The graph is rendered by App, so it doesn't change when switching tabs
      return null;
    case PaneType.SETTINGS:
      paneComponent = <SettingsPane />;
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
