import { html, useState, createContext } from '/vendor/preact.js';

import Inspector from './Inspector.js';
import Graph from './Graph.js';

export const AppContext = createContext(null);

function Splitter({ onClick, isOpen }) {
  return html`
    <div id="splitter" className="theme-dark bright-hover" onClick=${onClick}>${isOpen ? '\u{25b6}' : '\u{25c0}'}</div>
  `;
}

export default function App() {
  // Parse url query param, "q"
  const q = /q=([^&]+)/.test(location.search) && RegExp.$1;
  const query = q ? decodeURIComponent(q).split(/\s*,\s*/) : [];

  const context = {
    pane: useState('info'),
    inspectorOpen: useState(true),
    query: useState(query),
    module: useState([]),
    graph: useState([]),
    colorize: useState(false),
    depIncludes: useState(['dependencies'])
  };

  const [inspectorOpen, setInspectorOpen] = context.inspectorOpen;
  return html`
    <${AppContext.Provider} value=${context}>
      <${Graph} />      
      <${Splitter} isOpen=${inspectorOpen} onClick=${() => setInspectorOpen(!inspectorOpen)} />
      <${Inspector} className=${inspectorOpen ? 'open' : ''} />
    </${AppContext.Provider}>`;
}