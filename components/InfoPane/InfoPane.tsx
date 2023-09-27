import React, { HTMLProps } from 'react';
import { ModulePackage } from '../../lib/Module.js';
import { cacheLocalPackage } from '../../lib/ModuleCache.js';
import useLocation from '../../lib/useLocation.js';
import { useQuery } from '../App.js';
import { Pane } from '../Pane.js';
import './InfoPane.scss';
import LocalModuleList from './LocalModuleList.js';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  const [, setQuery] = useQuery();
  const [location, setLocation] = useLocation();

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

    // Inject package into local cache and get corresponding Module
    const module = cacheLocalPackage(pkg);

    // Update UI
    setQuery([module.key]);

    // Update location
    const url = new URL(location);
    url.searchParams.set('q', module.key);
    setLocation(url);
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
        <a href="?q=minimatch, cross-env, rimraf">
          &quot;minimatch, cross-env, rimraf&quot;
        </a>
        ).
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
      <LocalModuleList />
    </Pane>
  );
}
