import type { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { PaneType, PARAM_HIDE } from '../lib/constants.ts';
import type { PaneTypes } from '../lib/constants.ts';
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

  const isActivePane = (paneType: PaneTypes) => pane === paneType;

  return (
    <div className={cn(styles.inspector, className)} {...restProps}>
      <InfoPane
        aria-hidden={!isActivePane(PaneType.INFO)}
        className={cn(!isActivePane(PaneType.INFO) && styles.hiddenPane)}
      />
      <GraphPane
        aria-hidden={!isActivePane(PaneType.REPORT)}
        className={cn(
          graphPaneStyles.paneGraph,
          !isActivePane(PaneType.REPORT) && styles.hiddenPane,
        )}
        graph={graph}
      />
      <div
        aria-hidden={!isActivePane(PaneType.GRAPH)}
        className={cn(!isActivePane(PaneType.GRAPH) && styles.hiddenPane)}
      >
        <GraphDiagram activity={activity} />
      </div>
      <ModulePane
        aria-hidden={!isActivePane(PaneType.MODULE)}
        className={cn(!isActivePane(PaneType.MODULE) && styles.hiddenPane)}
        selectedModules={selectedModules}
      />
      <SettingsPane
        aria-hidden={!isActivePane(PaneType.SETTINGS)}
        className={cn(!isActivePane(PaneType.SETTINGS) && styles.hiddenPane)}
      />
    </div>
  );
}
