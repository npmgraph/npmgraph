import type { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import { cn } from '../lib/dom.ts';
import type LoadActivity from '../lib/LoadActivity.ts';
import useGraphSelection from '../lib/useGraphSelection.ts';
import useHashParam from '../lib/useHashParam.ts';
import GraphDiagram from './GraphDiagram/GraphDiagram.tsx';
import * as graphPaneStyles from './GraphPane/GraphPane.module.scss';
import GraphPane from './GraphPane/GraphPane.tsx';
import InfoPane from './InfoPane/InfoPane.tsx';
import * as styles from './Inspector.module.scss';
import ModulePane from './ModulePane/ModulePane.tsx';
import { Pane } from './Pane.tsx';
import SettingsPane from './SettingsPane/SettingsPane.tsx';

export default function Inspector(
  props: HTMLProps<HTMLDivElement> & { activity: LoadActivity },
) {
  const { className, activity, ...restProps } = props;
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
      paneComponent = (
        <GraphPane className={graphPaneStyles.paneGraph} graph={graph} />
      );
      break;
    case PaneType.GRAPH:
      paneComponent = (
        <Pane className={graphPaneStyles.paneGraph}>
          <GraphDiagram activity={activity} />
        </Pane>
      );
      break;
    case PaneType.SETTINGS:
      paneComponent = <SettingsPane />;
      break;
    case PaneType.INFO:
      paneComponent = <InfoPane />;
      break;
  }
  return (
    <div className={cn(styles.inspector, className)} {...restProps}>
      {paneComponent}
    </div>
  );
}
