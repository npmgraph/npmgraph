import { html, useState, createContext } from '/vendor/preact.js';

import Inspector from './Inspector.js';
import Graph from './Graph.js';
import { LoadActivity } from './util.js';
import { useEffect } from '../vendor/preact.js';
import Store from './Store.js';
import { Loader } from './Components.js';

export const AppContext = createContext(null);

function Splitter({ onClick, isOpen }) {
  return html`
    <div id="splitter" className="theme-dark bright-hover" onClick=${onClick}>${isOpen ? '\u{25b6}' : '\u{25c0}'}</div>
  `;
}

// Parse url query param from browser location, "q"
function queryFromLocation() {
  const q = /q=([^&]+)/.test(location.search) && RegExp.$1;
  return q ? decodeURIComponent(q).split(/\s*,\s*/) : [];
}

export const activity = new LoadActivity();
export const store = new Store(activity);
export function useActivity() {
  const [bool, setBool] = useState(true);
  activity.onChange = () => setBool(!bool);
  return activity;
}

export default function App() {
  const context = {
    pane: useState('info'),
    inspectorOpen: useState(true),
    query: useState(queryFromLocation()),
    module: useState([]),
    graph: useState([]),
    colorize: useState(false),
    depIncludes: useState(['dependencies'])
  };

  const activity = useActivity();

  useEffect(() => {
    function handlePopState() {
      const { query: [, setQuery] } = context;
      setQuery(queryFromLocation());
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [inspectorOpen, setInspectorOpen] = context.inspectorOpen;

  return html`
    <${AppContext.Provider} value=${context}>
      ${activity.total > 0 ? html`<${Loader} activity=${activity} />` : null}
      <${Graph} />
      <${Splitter} isOpen=${inspectorOpen} onClick=${() => setInspectorOpen(!inspectorOpen)} />
      <${Inspector} className=${inspectorOpen ? 'open' : ''} />
    </${AppContext.Provider}>`;
}
