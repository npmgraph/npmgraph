import type { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { cn } from '../lib/dom.ts';
import useGraphSelection from '../lib/useGraphSelection.ts';
import useHashParam from '../lib/useHashParam.ts';
import * as graphPaneStyles from './GraphPane/GraphPane.module.scss';
import GraphPane from './GraphPane/GraphPane.tsx';
import InfoPane from './InfoPane/InfoPane.tsx';
import * as styles from './Inspector.module.scss';
import ModulePane from './ModulePane/ModulePane.tsx';
import SettingsPane from './SettingsPane/SettingsPane.tsx';

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
      paneComponent = (
        <ModulePane id="pane-module" selectedModules={selectedModules} />
      );
      break;
    case PaneType.GRAPH:
      paneComponent = (
        <GraphPane
          id="pane-graph"
          className={graphPaneStyles.paneGraph}
          graph={graph}
        />
      );
      break;
    case PaneType.SETTINGS:
      paneComponent = <SettingsPane id="pane-settings" />;
      break;
    case PaneType.INFO:
      paneComponent = <InfoPane id="pane-info" />;
      break;
  }
  return (
    <div
      id="inspector"
      className={cn(styles.inspector, className)}
      {...restProps}
    >
      {paneComponent}
    </div>
  );
}
