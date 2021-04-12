import React, { useState } from 'react';
import { Pane, QueryLink } from './Inspector';
import { store, sharedState } from './App';

// Get names of uploaded modules in session storage
function getFileEntries() {
  return Object.keys(window.sessionStorage)
    .map(k => k.replace('/', '@').replace(/%2f/ig, '/'));
}

export default function InfoPane() {
  const [, setQuery] = sharedState.use('query');

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

    const pkg = JSON.parse(content);

    if (!pkg?.name) pkg.name = '(upload)';
    if (!pkg?.version) {
      const d = new Date();
      // Make semver string of form YYYY.MM.DD-HH:MM:SS.ddd
      pkg.version = d.toISOString().replace(/-/g, '.').replace('T', '-');
    }

    // Mark package as having been supplied by the user
    pkg._dropped = true;

    // Stash upload in
    const cacheKey = store.cachePackage(pkg);
    window.sessionStorage.setItem(cacheKey, JSON.stringify(pkg));
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

  return <Pane style={{ display: 'flex', flexDirection: 'column' }}>
      <input id='package-input' type='file' hidden onChange={onSelect} accept='.json'/>

      <p>
      Enter NPM module name here <i className='material-icons'>arrow_upward</i> to see the dependency graph.
      Separate multiple module names with commas (e.g. <a href='?q=mocha, chalk, rimraf'>&quot;mocha, chalk, rimraf&quot;</a>).
      </p>

      <label htmlFor='package-input' id='drop_target' style={{ textAlign: 'center', cursor: 'pointer' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        Alternatively, <button type='button'>select</button> or drop a <code>package.json</code> file here
      </label>
        {
          recents.length ? <>
            <div style={{ textAlign: 'start' }}>
              <p style={{ marginTop: '1em' }}>Recent files:</p>
              <ul>
                {recents.map(name => <li key={name}><QueryLink query={name} /></li>)}
              </ul>
            </div>
            <div style={{ fontSize: '85%', color: 'gray' }}>
              (Dropped files do not leave your computer and are cleared when browser closes.)
            </div>
          </>
            : null
        }
    </Pane>;
}
