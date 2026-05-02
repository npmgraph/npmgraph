import type { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.ts';
import { queryModuleCache } from '../lib/ModuleCache.ts';
import { PANE, PARAM_HIDE } from '../lib/constants.ts';
import useGraphSelection from '../lib/useGraphSelection.ts';
import useHashParam from '../lib/useHashParam.ts';
import AppHeader from './AppHeader.tsx';
import GraphPane from './GraphPane/GraphPane.tsx';
import InfoPane from './InfoPane/InfoPane.tsx';
import './Inspector.scss';
import ModulePane from './ModulePane/ModulePane.tsx';
import { Splitter } from './Splitter.tsx';
import { Tab } from './Tab.tsx';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.ts';

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGlobalState('graph');
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const selectedModules = queryModuleCache(queryType, queryValue);

  useKeyboardShortcuts();

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
    case PANE.INFO:
      paneComponent = <InfoPane id="pane-info" />;
      break;
  }

  return (
    <div id="inspector" className={hide !== null ? '' : 'open'} {...props}>
      <AppHeader />
      <div id="tabs">
        <Tab active={pane === PANE.INFO} onClick={() => setPane(PANE.INFO)}>
          Start
        </Tab>
        <Tab active={pane === PANE.GRAPH} onClick={() => setPane(PANE.GRAPH)}>
          Graph
        </Tab>
        <Tab active={pane === PANE.MODULE} onClick={() => setPane(PANE.MODULE)}>
          Module
        </Tab>
        <Splitter
          isOpen={hide === null}
          onClick={() => setHide(hide === null)}
        />
      </div>

      {paneComponent}
    </div>
  );
}
