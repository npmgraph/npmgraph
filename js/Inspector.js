/* global ENV */

import React, { useContext } from 'React';
import { AppContext } from './App.js';
import { tagify } from './util.js';
import md5 from '/vendor/md5.js';
import ModulePane from './ModulePane.js';
import GraphPane from './GraphPane.js';
import InfoPane from './InfoPane.js';
import { selectTag } from './Graph.js';

export function Fix() {
  return <span style={{ fontWeight: 'bold', color: 'red' }}>FIX!</span>;
}

export function ExternalLink({ href, children, target = '_blank', className, style, ...props }) {
  return <a href={href} className={`bright-hover ${className}`} target={target} style={{ marginRight: '8px', ...style }} {...props}>
  {children}
  <span style={{ marginLeft: 0 }} className='material-icons'>open_in_new</span>
  </a>;
}

export function QueryLink({ query }) {
  const { query: [, setQuery] } = useContext(AppContext);
  if (!Array.isArray(query)) query = [query];
  return <a href='#' onClick={e => {
    e.preventDefault();
    setQuery(query);
    history.pushState(null, null, `${location.pathname}?q=${query.join(',')}`);
  }}>{query.join(',')}</a>;
}

export function Section({ title, children, open = true, style, ...props }) {
  return <details open={open}>
    <summary>{title || 'Untitled'}</summary>
    {children}
  </details>;
}

export function Pane({ children, ...props }) {
  return <div className='pane theme-lite'>{children}</div>;
}

export function Tags({ children, style, ...props }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', ...style }} {...props}>
    {children}
  </div>;
}

export function Tag({ type, name, title = name, count = 0, gravatar, ...props }) {
  if (count > 1) title += ` (${count})`;

  let img = null;
  if (gravatar) {
    const hash = md5(gravatar)
      .map(v => v.toString(16).padStart(2, '0'))
      .join('');
    img = <img src={`https://www.gravatar.com/avatar/${hash}?s=32`} />;
  }

  return <div className='tag {type} bright-hover' title={title}
    onClick={() => selectTag(tagify(type, name), true, true)}>{img}{title}</div>;
}

function Tab({ active, children, ...props }) {
  return <div className={`tab bright-hover ${active ? 'active' : ''}`} {...props}>{children}</div>;
}

export default function Inspector({ className, ...props }) {
  const {
    query: [query, setQuery],
    pane: [pane, setPane],
    module: [module],
    graph: [graph]
  } = useContext(AppContext);

  let paneComponent;
  switch (pane) {
    case 'module': paneComponent = <ModulePane module={module} />; break;
    case 'graph': paneComponent = <GraphPane graph={graph} />; break;
    case 'info': paneComponent = <InfoPane />; break;
  }

  return <div id='inspector' className={`theme-light ${className}`} {...props} >
      <div id='tabs' className='theme-dark'>
        <Tab active={pane == 'module'} onClick={() => setPane('module')}>Module</Tab>
        <Tab active={pane == 'graph'} onClick={() => setPane('graph')}>Graph</Tab>
        <Tab active={pane == 'info'} onClick={() => setPane('info')}>{'\u{24d8}'}</Tab>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type='text'
            id='search-field'
            value={query.join(',')}
            onChange={e => {
              // Convert input text to unique list of names
              const names = [...new Set(e.currentTarget.value.split(/,\s*/).filter(x => x))];

              // Update location
              const url = new URL(location);
              url.search = `?q=${names.join(',')}`;
              url.hash = '';
              history.replaceState(null, window.title, url);

              setQuery(names);
            }}
            placeholder={'\u{1F50D} \xa0Enter module name'}
            autoFocus
          />
        </div>
      </div>

      {paneComponent}

      <footer className='theme-dark'>
        NPMGraph v${ENV.appVersion} ${'\xa9'} Robert Kieffer, 2020  MIT License – <ExternalLink
            id='github'
            href='https://github.com/npmgraph/npmgraph'>
          GitHub
        </ExternalLink>
      </footer>
    </div>;
}
