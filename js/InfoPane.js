import { html, useContext, useState } from '../vendor/preact.js';
import { Pane, QueryLink } from './Inspector.js';
import { AppContext, store } from './App.js';

// Get names of uploaded modules in session storage
function getFileEntries() {
  return Object.keys(window.sessionStorage)
    .map(k => k.replace('/', '@').replace(/%2f/ig, '/'));
}

export default function InfoPane() {
  const { query: [, setQuery] } = useContext(AppContext);

  const [recents, setRecents] = useState(getFileEntries());

  // Handle file selection via input
  const onSelect = (ev) => {
    readFile(ev.target.files.item(0));

    // Reset field
    ev.target.value = '';
  };

  // Handle file drops
  const onDrop = ev => {
    ev.target.classList.remove('drag');
    ev.preventDefault();

    // If dropped items aren't files, reject them
    const dt = ev.dataTransfer;
    if (!dt.items) return alert('Sorry, file dropping is not supported by this browser');
    if (dt.items.length != 1) return alert('You must drop exactly one file');

    const item = dt.items[0];
    if (item.type && item.type != 'application/json') return alert('File must have a ".json" extension');

    const file = item.getAsFile();
    if (!file) return alert('Please drop a file, not... well... whatever else it was you dropped');

    readFile(file);
  };

  const readFile = async file => {
    const reader = new FileReader();

    const content = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsText(file);
    });

    const module = JSON.parse(content);

    if (!module?.name) module.name = '(upload)';
    if (!module?.version) {
      const d = new Date();
      // Make semver string of form YYYY.MM.DD-HH:MM:SS.ddd
      module.version = d.toISOString().replace(/-/g, '.').replace('T', '-');
    }

    // Stash upload in
    const cacheKey = store.cacheModule(module);
    window.sessionStorage.setItem(cacheKey, JSON.stringify(module));
    const key = cacheKey.replace(/\//, '@');
    setQuery([key]);
    setRecents(getFileEntries());
    history.pushState(null, null, `${location.pathname}?q=${key}`);
  };

  const onDragOver = ev => {
    ev.target.classList.add('drag');
    ev.preventDefault();
  };

  const onDragLeave = ev => {
    ev.currentTarget.classList.remove('drag');
    ev.preventDefault();
  };

  return html`
    <${Pane} style=${{ display: 'flex', flexDirection: 'column' }}>
      <input id="package-input" type="file" hidden onChange=${onSelect} accept=".json"/>
      <p>
      Enter NPM module name here <i class="material-icons">arrow_upward</i> to see the dependency graph.  Separate multiple module names with commas (e.g. <a href="?q=mocha, chalk, rimraf">"mocha, chalk, rimraf"</a>).
      </p>
      <label for="package-input" id="drop_target" style="text-align: center"
        onDrop=${onDrop}
        onDragOver=${onDragOver}
        onDragLeave=${onDragLeave}
      >
        Alternatively, <button type="button">select</button> or drop a <code>package.json</code> file here
      </label>
        ${
          recents.length ? html`<div  style=${{ textAlign: 'start' }}>
            <p style=${{ marginTop: '1em' }}>Recent files:</p>
            <ul>
              ${recents.map(name => html`<li><${QueryLink} query=${name} /></li>`)}
            </ul>
          </div>
          <div style=${{ fontSize: '85%', color: 'gray' }}>
            (Dropped files do not leave your computer and are cleared when browser closes.)
          </div>
          ` : null
        }
    </${Pane}>`;
}