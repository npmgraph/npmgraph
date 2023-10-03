import React, { HTMLProps, useEffect, useState } from 'react';
import { queryModuleCache } from '../lib/ModuleCache.js';
import fetchJSON from '../lib/fetchJSON.js';
import { GithubCommit } from '../lib/fetch_types.js';
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

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [pane, setPane] = usePane();
  const [queryType, queryValue] = useGraphSelection();
  const [graph] = useGraph();
  const [commits, setCommits] = useState<GithubCommit[]>([]);

  const selectedModules = queryModuleCache(queryType, queryValue);
  const firstModule = selectedModules.values().next().value;

  useEffect(() => {
    async function fetchCommits() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      try {
        const commits = await fetchJSON<GithubCommit[]>(
          `https://api.github.com/repos/npmgraph/npmgraph/commits?since=${since.toISOString()}`,
          { silent: true },
        );
        setCommits(commits);
      } catch (err) {
        // ignore
        setCommits([]);
      }
    }

    const timeout = setTimeout(fetchCommits, 1000);

    return () => clearTimeout(timeout);
  }, []);

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
      paneComponent = <AboutPane id="pane-about" commits={commits} />;
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
        <Tab
          active={pane == 'about'}
          onClick={() => setPane('about')}
          badge={commits.length || ''}
        >
          About
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
