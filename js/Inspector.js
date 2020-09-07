import { html, useState, useContext } from '../vendor/preact.js';
import { AppContext } from './App.js';

function Section({ title, children, ...props }) {
  const [isOpen, setOpen] = useState(true);

  return html`
    <section class=${title ? title.toLowerCase() : ''}>
      ${
        title ? html`
        <h2 onClick=${() => setOpen(!isOpen)}>
        ${title}
        <span class="material-icons">${isOpen ? 'expand_more' : 'expand_less'}</span>
        </h2>` : null
      }
      ${isOpen ? children : null}
    </section>`;
}

function Tab({ active, children, ...props }) {
  return html`<div className="tab ${active ? 'active' : ''}" ...${props}>${children}</div>`;
}

function Pane({ children, ...props }) {
  return html`<div className="pane">${children}</div>`;
}

function DepInclude({ type, ...props }) {
  const [depIncludes, setDepIncludes] = useContext(AppContext).depIncludes;

  let arrow = null;
  switch (type) {
    case 'devDependencies': arrow = html`(<span style="color: red">${'\u{27f6}'}</span>)`; break;
    case 'peerDependencies': arrow = html`(<span style="color: green">${'\u{27f6}'}</span>)`; break;
  }

  function toggle(e) {
    setDepIncludes(e.currentTarget.checked ? [type, ...depIncludes] : depIncludes.filter(t => type != t));
  }

  return html`
    <label class="depInclude">
      <input type="checkbox" checked=${depIncludes.includes(type)} onClick=${toggle}/>
      <code>${type}</code> ${arrow}
    </label>
  `;
}

function GraphPane() {
  const [inspectGraph] = useContext(AppContext).inspectGraph;

  return html`
    <${Pane}>
      <${Section}>
        Include:
        <${DepInclude} type="dependencies" />
        <${DepInclude} type="devDependencies" />
        <${DepInclude} type="peerDependencies" />

        <label style="display:block"><input type="checkbox" id="colorize" />Colorize by <a href="https://github.com/npms-io/npms-analyzer" target="_blank">npms.io score</a></label>
        <label style="display:block"><input type="checkbox" id="busFactor" />Show modules with 0-1 maintainer</label>
      <//>
      <${Section} title="Dependencies" />
      <${Section} title="Maintainers" />
      <${Section} title="Licenses">
        <div class="licenses" />
        <div id="chart" />
      <//>
    </${Pane}>`;
}

function ModulePane() {
  const [inspectModule] = useContext(AppContext).inspectModule;

  return html`
    <${Pane}>
      <${Section} title="Description" />
      <${Section} title="Stats" />
      <${Section} title="package.json">
        <div class="json" />
      <//>
    </${Pane}>`;
}

function InfoPane() {
  // // Handle file drops
  // Object.assign($('#drop_target'), {
  //   ondrop: async ev => {
  //     ev.target.classList.remove('drag');
  //     ev.preventDefault();

  //     // If dropped items aren't files, reject them
  //     const dt = ev.dataTransfer;
  //     if (!dt.items) return alert('Sorry, file dropping is not supported by this browser');
  //     if (dt.items.length != 1) return alert('You must drop exactly one file');

  //     const item = dt.items[0];
  //     if (item.type && item.type != 'application/json') return alert('File must have a ".json" extension');

  //     const file = item.getAsFile();
  //     if (!file) return alert('Please drop a file, not... well... whatever else it was you dropped');

  //     const reader = new FileReader();

  //     const content = await new Promise((resolve, reject) => {
  //       reader.onload = () => resolve(reader.result);
  //       reader.readAsText(file);
  //     });

  //     const module = new Module(JSON.parse(content));
  //     history.pushState({ module }, null, `${location.pathname}?upload=${file.name}`);
  //     graph(module);
  //   },

  //   ondragover: ev => {
  //     ev.target.classList.add('drag');
  //     ev.preventDefault();
  //   },

  //   ondragleave: ev => {
  //     ev.currentTarget.classList.remove('drag');
  //     ev.preventDefault();
  //   }
  // });

  return html`
    <${Pane} style=${{ display: 'flex', flexDirection: 'column' }}>
      <p>
      Enter NPM module name here <i class="material-icons">arrow_upward</i> to see the dependency graph.  Separate multiple module names with commas (e.g. <a href="?q=mocha, chalk, rimraf">"mocha, chalk, rimraf"</a>).
      </p>
      <div id="drop_target" style="text-align: center">
        ... or drop a <code>package.json</code> file here
      </div>
    </${Pane}>`;
}

export default function Inspector(props) {
  const context = useContext(AppContext);
  const {
    query: [query, setQuery],
    pane: [pane, setPane]
  } = context;

  let paneClass;
  switch (pane) {
    case 'module': paneClass = ModulePane; break;
    case 'graph': paneClass = GraphPane; break;
    case 'info': paneClass = InfoPane; break;
  }

  return html`
    <div id="inspector" ...${props} >
      <div id="tabs">
        <${Tab} active=${pane == 'module'} onClick=${() => setPane('module')}>Module<//>
        <${Tab} active=${pane == 'graph'} onClick=${() => setPane('graph')}>Graph<//>
        <${Tab} active=${pane == 'info'} onClick=${() => setPane('info')}>${'\u{24d8}'}<//>
        <input
          type="text" 
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

      <${paneClass} />

      <footer>
          ${'\xa9'} Robert Kieffer, 2020  MIT License
          <a id="github" target="_blank" href="https://github.com/broofa/npmgraph">GitHub</a>
      </footer>
    </div>`;
}