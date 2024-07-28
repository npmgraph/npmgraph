import { HTMLProps } from 'react';
import { useGlobalState } from '../lib/GlobalStore.js';
import { queryModuleCache } from '../lib/ModuleCache.js';
import { PARAM_HIDE } from '../lib/constants.js';
import useCommits from '../lib/useCommits.js';
import useGraphSelection from '../lib/useGraphSelection.js';
import useHashParam from '../lib/useHashParam.js';
import AboutPane from './AboutPane/AboutPane.js';
import GraphPane from './GraphPane/GraphPane.js';
import InfoPane from './InfoPane/InfoPane.js';
import './Inspector.scss';
import ModulePane from './ModulePane/ModulePane.js';
import { Splitter } from './Splitter.js';
import { Tab } from './Tab.js';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.js';

export enum PANE {
  MODULE = 'module',
  GRAPH = 'graph',
  INFO = 'info',
  ABOUT = 'about',
}
export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane, setPane] = useGlobalState('pane');
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGlobalState('graph');
  const [, newCommitsCount] = useCommits();
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
    case PANE.ABOUT:
      paneComponent = <AboutPane id="pane-about" />;
      break;
  }

  return (
    <div id="inspector" className={hide !== null ? '' : 'open'} {...props}>
      <div id="tabs">
        <Tab active={pane == PANE.INFO} onClick={() => setPane(PANE.INFO)}>
          Start <kbd>/</kbd>
        </Tab>
        <Tab active={pane == PANE.GRAPH} onClick={() => setPane(PANE.GRAPH)}>
          Graph
        </Tab>
        <Tab active={pane == PANE.MODULE} onClick={() => setPane(PANE.MODULE)}>
          Module
        </Tab>
        <Tab
          active={pane == PANE.ABOUT}
          onClick={() => setPane(PANE.ABOUT)}
          badge={newCommitsCount > 0}
        >
          About
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
