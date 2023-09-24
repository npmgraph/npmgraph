import React, { HTMLProps, useState } from 'react';
import { useQuery } from '../components/App.js';
import { Pane } from '../components/Pane.js';
import { QueryLink } from '../components/QueryLink.js';
import Module, { ModulePackage } from '../util/Module.js';
import { cacheModule } from '../util/ModuleRegistry.js';
import '/css/InfoPane.scss';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  const [, setQuery] = useQuery();

  const [recents, setRecents] = useState(getFileEntries());

  // Handle file selection via input
  const onSelect = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.item(0);
    if (file) {
      readFile(file);
    }

    // Reset field
    ev.target.value = '';
  };

  // Handle file drops
  const onDrop = (ev: React.DragEvent) => {
    const target = ev.target as HTMLElement;
    target.classList.remove('drag');
    ev.preventDefault();

    // If dropped items aren't files, reject them
    const dt = ev.dataTransfer;
    if (!dt.items)
      return alert('Sorry, file dropping is not supported by this browser');
    if (dt.items.length != 1) return alert('You must drop exactly one file');

    const item = dt.items[0];
    if (item.type && item.type != 'application/json')
      return alert('File must have a ".json" extension');

    const file = item.getAsFile();
    if (!file)
      return alert(
        'Please drop a file, not... well... whatever else it was you dropped',
      );

    readFile(file);
  };

  const readFile = async (file: File) => {
    const reader = new FileReader();

    const content: string = await new Promise(resolve => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });

    const pkg: ModulePackage = JSON.parse(content);

    // Construct a local module for the package
    if (!pkg.name) pkg.name = '(upload)';
    if (!pkg.version) {
      // Make semver string of form YYYY.MM.DD-HH:MM:SS.ddd
      pkg.version = new Date()
        .toISOString()
        .replace(/-/g, '.')
        .replace('T', '-');
    }
    pkg._local = true;
    const module = new Module(pkg);

    // Cache module in registry and session storage
    cacheModule(module);
    window.sessionStorage.setItem(module.key, JSON.stringify(pkg));

    // Update UI
    setQuery([module.key]);
    setRecents(getFileEntries());

    // Update location
    const url = new URL(location.href);
    url.searchParams.set('q', module.key);
    history.pushState(null, '', url);
  };

  const onDragOver = (ev: React.DragEvent<HTMLElement>) => {
    const target = ev.target as HTMLElement;
    target.classList.add('drag');
    ev.preventDefault();
  };

  const onDragLeave = (ev: React.DragEvent<HTMLElement>) => {
    const currentTarget = ev.currentTarget as HTMLElement;
    currentTarget.classList.remove('drag');
    ev.preventDefault();
  };

  return (
    <Pane style={{ display: 'flex', flexDirection: 'column' }} {...props}>
      <input
        id="package-input"
        type="file"
        hidden
        onChange={onSelect}
        accept=".json"
      />

      <p>
        Enter npm module name here{' '}
        <i className="material-icons">arrow_upward</i> to see the dependency
        graph. Separate multiple module names with commas (e.g.{' '}
        <a href="?q=mocha, chalk, rimraf">&quot;mocha, chalk, rimraf&quot;</a>).
      </p>

      <label
        htmlFor="package-input"
        id="drop_target"
        style={{ textAlign: 'center', cursor: 'pointer' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        Alternatively, <button type="button">select</button> or drop a{' '}
        <code>package.json</code> file here
      </label>
      {recents.length ? (
        <>
          <div style={{ textAlign: 'start' }}>
            <p style={{ marginTop: '1em' }}>Recent files:</p>
            <ul>
              {recents.map(name => (
                <li key={name}>
                  <QueryLink query={name} />
                </li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: '85%', color: 'gray' }}>
            (Dropped files do not leave your computer and are cleared when
            browser closes.)
          </div>
        </>
      ) : null}
    </Pane>
  );
}

// Get names of uploaded modules in session storage
function getFileEntries() {
  return Object.keys(window.sessionStorage);
}
