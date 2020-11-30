import { html, useContext } from '../vendor/preact.js';
import { Pane } from './Inspector.js';
import { cacheModule } from './Store.js';
import { AppContext } from './App.js';

export default function InfoPane() {
  const { query: [, setQuery] } = useContext(AppContext);

  // Handle file drops
  const onDrop = async ev => {
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

    const reader = new FileReader();

    const content = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsText(file);
    });

    const module = JSON.parse(content);
    if (!module?.name) module.name = '(Uploaded package)';
    const modulePath = cacheModule(module);
    setQuery([modulePath]);
    history.pushState({ module }, null, `${location.pathname}?q=${modulePath}`);
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
      <p>
      Enter NPM module name here <i class="material-icons">arrow_upward</i> to see the dependency graph.  Separate multiple module names with commas (e.g. <a href="?q=mocha, chalk, rimraf">"mocha, chalk, rimraf"</a>).
      </p>
      <div id="drop_target" style="text-align: center"
        onDrop=${onDrop}
        onDragOver=${onDragOver}
        onDragLeave=${onDragLeave}
      >
        ... or drop a <code>package.json</code> file here
      </div>
    </${Pane}>`;
}