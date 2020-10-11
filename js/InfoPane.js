import { html } from '../vendor/preact.js';
import { Pane } from './Inspector.js';

export default function InfoPane() {
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