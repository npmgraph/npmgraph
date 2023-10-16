import React, { HTMLProps } from 'react';
import { queryModuleCache } from '../lib/ModuleCache.js';
import useCommits from '../lib/useCommits.js';
import useGraphSelection from '../lib/useGraphSelection.js';
import { version as VERSION } from '../package.json';
import AboutPane from './AboutPane/AboutPane.js';
import { useGraph, usePane } from './App/App.js';
import { ExternalLink } from './ExternalLink.js';
import GraphPane from './GraphPane/GraphPane.js';
import InfoPane from './InfoPane/InfoPane.js';
import './Inspector.scss';
import ModulePane from './ModulePane/ModulePane.js';
import { Tab } from './Tab.js';
import { Splitter } from './Splitter.js';
import { PARAM_VIEW_MODE, VIEW_MODE_CLOSED } from '../lib/constants.js';
import useHashParam from '../lib/useHashParam.js';

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane, setPane] = usePane();
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGraph();
  const [, newCommitsCount] = useCommits();
  const [viewMode, setViewMode] = useHashParam(PARAM_VIEW_MODE);

  const isOpen = viewMode != VIEW_MODE_CLOSED;

  const selectedModules = queryModuleCache(queryType, queryValue);
  const firstModule = selectedModules.values().next().value;

  let paneComponent;
  switch (pane) {
    case 'module':
      paneComponent = <ModulePane id="pane-module" module={firstModule} />;
      break;
    case 'graph':
      paneComponent = <GraphPane id="pane-graph" graph={graph} />;
      break;
    case 'info':
      paneComponent = <InfoPane id="pane-info" />;
      break;
    case 'about':
      paneComponent = <AboutPane id="pane-about" />;
      break;
  }

  return (
    <div id="inspector" className={viewMode ? '' : 'open'} {...props}>
      <div id="tabs">
        <Tab active={pane == 'info'} onClick={() => setPane('info')}>
          Start
        </Tab>
        <Tab active={pane == 'graph'} onClick={() => setPane('graph')}>
          Graph
        </Tab>
        <Tab active={pane == 'module'} onClick={() => setPane('module')}>
          Module
        </Tab>
        <Tab
          active={pane == 'about'}
          onClick={() => setPane('about')}
          badge={newCommitsCount > 0}
        >
          About
        </Tab>
        <Splitter
          isOpen={isOpen}
          onClick={() => setViewMode(isOpen ? VIEW_MODE_CLOSED : '')}
        />
      </div>

      {paneComponent}

      <footer>
        {'\xa9'} npmgraph Contributors &mdash;{' '}
        <ExternalLink id="github" href="https://github.com/npmgraph/npmgraph">
          GitHub
        </ExternalLink>{' '}
        &mdash; v{VERSION}
      </footer>
    </div>
  );
}
