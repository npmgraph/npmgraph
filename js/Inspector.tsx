import React, { AnchorHTMLAttributes, HTMLAttributes, HTMLProps } from 'react';
import { version as VERSION } from '../package.json';
import { useGraph, useModule, usePane, useQuery } from './App.js';
import GraphPane from './GraphPane.js';
import InfoPane from './InfoPane.js';
import ModulePane from './ModulePane.js';
import '/css/Inspector.scss';
import { ExternalLink } from './components/ExternalLink.js';
import { Tab } from './components/Tab.js';

export default function Inspector(props: HTMLProps<HTMLDivElement>) {
  const [query, setQuery] = useQuery();
  const [pane, setPane] = usePane();
  const [module] = useModule();
  const [graph] = useGraph();

  let paneComponent;
  switch (pane) {
    case 'module':
      paneComponent = <ModulePane id="pane-module" module={module} />;
      break;
    case 'graph':
      paneComponent = <GraphPane id="pane-graph" graph={graph} />;
      break;
    case 'info':
      paneComponent = <InfoPane id="pane-info" />;
      break;
  }

  function doSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    const names = (e.currentTarget as HTMLInputElement).value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    const query = [...new Set(names)]; // De-dupe

    // Update location
    const url = new URL(location.href);
    url.hash = '';
    query.length
      ? url.searchParams.set('q', query.join(','))
      : url.searchParams.delete('q');

    history.replaceState(null, document.title, url);

    setQuery(query);
  }

  return (
    <div id="inspector" {...props}>
      <div id="tabs">
        <Tab active={pane == 'module'} onClick={() => setPane('module')}>
          Module
        </Tab>
        <Tab active={pane == 'graph'} onClick={() => setPane('graph')}>
          Graph
        </Tab>
        <Tab active={pane == 'info'} onClick={() => setPane('info')}>
          {'\u{24d8}'}
        </Tab>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            id="search-field"
            defaultValue={query}
            onKeyDown={e => {
              if (/^(?:Enter|Tab)$/.test(e.key)) doSearch(e);
            }}
            placeholder={'\u{1F50D} \xa0Enter module name'}
            autoFocus
          />
        </div>
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
