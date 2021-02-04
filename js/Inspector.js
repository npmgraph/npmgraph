/* global ENV */

import { html, useContext } from '/vendor/preact.js';
import { AppContext } from './App.js';
import { tagify } from './util.js';
import md5 from '/vendor/md5.js';
import ModulePane from './ModulePane.js';
import GraphPane from './GraphPane.js';
import InfoPane from './InfoPane.js';
import { selectTag } from './Graph.js';

export function Fix() {
  return html`<span style=${{ fontWeight: 'bold', color: 'red' }}>FIX!</span>`;
}

export function ExternalLink({ href, children, target = '_blank', className, style, ...props }) {
  return html`<a href=${href} className="bright-hover ${className}"  target=${target} style=${{ marginRight: '8px', ...style }} ...${props}>
  ${children}
  <span style=${{ marginLeft: '0px' }} class="material-icons">open_in_new</span>
  </a>`;
}

export function QueryLink({ query }) {
  const { query: [, setQuery] } = useContext(AppContext);
  if (!Array.isArray(query)) query = [query];
  const url = location.pathname}?q=${query.join(',');
  return html`<a href=${url} onClick=${e => {
    e.preventDefault();
    setQuery(query);
    history.pushState(null, null, `${url}`);
  }}>${query.join(',')}</a>`;
}

export function Section({ title, children, open = true, style, ...props }) {
  return html`
    <details open=${open}>
      <summary>${title || 'Untitled'}</summary>
      ${children}
    </details>`;
}

export function Pane({ children, ...props }) {
  return html`<div className="pane theme-lite">${children}</div>`;
}

export function Tags({ children, style, ...props }) {
  return html`<div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', ...style }} ...${props}>
    ${children}
  </div>`;
}

export function Tag({ type, name, title = name, count = 0, gravatar, ...props }) {
  if (count > 1) title += ` (${count})`;

  let img = null;
  if (gravatar) {
    const hash = md5(gravatar)
      .map(v => v.toString(16).padStart(2, '0'))
      .join('');
    img = html`<img src="https://www.gravatar.com/avatar/${hash}?s=32" />`;
  }

  return html`<div className="tag ${type} bright-hover" title=${title}
    onClick=${() => selectTag(tagify(type, name), true, true)}>${img}${title}</div>`;
}

function Tab({ active, children, ...props }) {
  return html`<div className="tab bright-hover ${active ? 'active' : ''}" ...${props}>${children}</div>`;
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
    case 'module': paneComponent = html`<${ModulePane} module=${module} />`; break;
    case 'graph': paneComponent = html`<${GraphPane} graph=${graph} />`; break;
    case 'info': paneComponent = html`<${InfoPane} />`; break;
  }

  return html`
    <div id="inspector" className="theme-dark ${className}" ...${props} >
      <div id="tabs">
        <${Tab} active=${pane == 'module'} onClick=${() => setPane('module')}>Module<//>
        <${Tab} active=${pane == 'graph'} onClick=${() => setPane('graph')}>Graph<//>
        <${Tab} active=${pane == 'info'} onClick=${() => setPane('info')}>${'\u{24d8}'}<//>
        <div style=${{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            style=${{ marginLeft: '1em', padding: '4px 8px', border: 'none', borderRadius: '15px' }}
            value=${query.join(',')}
            onChange=${e => {
              // Convert input text to unique list of names
              const names = [...new Set(e.currentTarget.value.split(/,\s*/).filter(x => x))];

              // Update location
              const url = new URL(location);
              url.search = `?q=${names.join(',')}`;
              url.hash = '';
              history.replaceState(null, window.title, url);

              setQuery(names);
            }}
            placeholder=${'\u{1F50D} \xa0Enter module name'}
            autofocus
          />
        </div>
      </div>

      ${paneComponent}

      <footer>
        <span style=${{ fontSize: '85%', opacity: '.5', marginRight: '1em' }}>v${ENV.appVersion}</span>
        ${'\xa9'} Robert Kieffer, 2020  MIT License
        <${ExternalLink}
          id="github"
          className="bright-hover"
          href="https://github.com/broofa/npmgraph">
          GitHub
        </${ExternalLink}>
      </footer>
    </div>`;
}
