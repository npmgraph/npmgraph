import React, { HTMLProps } from 'react';
import { queryModuleCache } from '../lib/ModuleCache.js';
import useGraphSelection from '../lib/useGraphSelection.js';
import { version as VERSION } from '../package.json';
import { useGraph, usePane } from './App.js';
import { ExternalLink } from './ExternalLink.js';
import GraphPane from './GraphPane/GraphPane.js';
import InfoPane from './InfoPane/InfoPane.js';
import './Inspector.scss';
import ModulePane from './ModulePane/ModulePane.js';
import { Tab } from './Tab.js';

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane, setPane] = usePane();
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGraph();

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
  }

  return (
    <div id="inspector" {...props}>
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
