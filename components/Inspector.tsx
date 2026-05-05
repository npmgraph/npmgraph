import type { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { PANE, PARAM_HIDE } from '../lib/constants.ts';
import useGraphSelection from '../lib/useGraphSelection.ts';
import useHashParam from '../lib/useHashParam.ts';
import GraphPane from './GraphPane/GraphPane.tsx';
import InfoPane from './InfoPane/InfoPane.tsx';
import './Inspector.scss';
import ModulePane from './ModulePane/ModulePane.tsx';
import SettingsPane from './SettingsPane/SettingsPane.tsx';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.ts';

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane] = useGlobalState('pane');
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGlobalState('graph');
  const [hide] = useHashParam(PARAM_HIDE);

  useKeyboardShortcuts();

  if (hide !== null) {
    return null;
  }

  const selectedModules = queryModuleCache(queryType, queryValue);

  let paneComponent;
  switch (pane) {
    case PANE.MODULE:
      paneComponent = (
        <ModulePane id="pane-module" selectedModules={selectedModules} />
      );
      break;
    case PANE.GRAPH:
      paneComponent = <GraphPane id="pane-graph" graph={graph} />;
      break;
    case PANE.SETTINGS:
      paneComponent = <SettingsPane id="pane-settings" />;
      break;
    case PANE.INFO:
      paneComponent = <InfoPane id="pane-info" />;
      break;
  }

  return (
    <div id="inspector" {...props}>
      {paneComponent}
    </div>
  );
}
