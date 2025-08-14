import type { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.js';
import { queryModuleCache } from '../lib/ModuleCache.js';
import { PANE, PARAM_HIDE } from '../lib/constants.js';
import useGraphSelection from '../lib/useGraphSelection.js';
import useHashParam from '../lib/useHashParam.js';
import GraphPane from './GraphPane/GraphPane.js';
import InfoPane from './InfoPane/InfoPane.js';
import './Inspector.scss';
import ModulePane from './ModulePane/ModulePane.js';
import { Splitter } from './Splitter.js';
import { Tab } from './Tab.js';
import useExternalInput from './useExternalInput.js';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.js';

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGlobalState('graph');
  const [hide, setHide] = useHashParam(PARAM_HIDE);

  const selectedModules = queryModuleCache(queryType, queryValue);

  useKeyboardShortcuts();
  useExternalInput();

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
      <div id="tabs">
        <Tab active={pane === PANE.INFO} onClick={() => setPane(PANE.INFO)}>
          Start <kbd>/</kbd>
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
