import { PackageJson } from '@npm/types';
import React, { HTMLProps } from 'react';
import { ModulePackage } from '../../lib/Module.js';
import { cacheLocalPackage } from '../../lib/ModuleCache.js';
import URLPlus from '../../lib/URLPlus.js';
import { PACKAGES_PARAM, QUERY_PARAM } from '../../lib/constants.js';
import useLocation from '../../lib/useLocation.js';
import './FileUploadControl.scss';

export default function FileUploadControl(props: HTMLProps<HTMLLabelElement>) {
  const [location, setLocation] = useLocation();

  // Handle file selection via input
  function onSelect(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.item(0);
    if (file) {
      readFile(file);
    }

    // Reset field
    ev.target.value = '';
  }

  // Handle file drops
  function onDrop(ev: React.DragEvent) {
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
  }

  async function readFile(file: File) {
    const reader = new FileReader();

    const content: string = await new Promise(resolve => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });

    // Parse module and insert into cache
    const pkg: PackageJson = JSON.parse(content);
    // Note: cacheLocalPackage() sanitizes pkg.keys in-place(!)
    const module = cacheLocalPackage(pkg as ModulePackage);

    // Set query, and attach package contents in hash
    const url = new URLPlus(location);
    url.hash = '';
    url.setHashParam(PACKAGES_PARAM, JSON.stringify([pkg]));
    url.setSearchParam(QUERY_PARAM, module.key);
    setLocation(url, false);
  }

  function onDragOver(ev: React.DragEvent<HTMLElement>) {
    const target = ev.target as HTMLElement;
    target.classList.add('drag');
    ev.preventDefault();
  }

  function onDragLeave(ev: React.DragEvent<HTMLElement>) {
    const currentTarget = ev.currentTarget as HTMLElement;
    currentTarget.classList.remove('drag');
    ev.preventDefault();
  }

  return (
    <>
      <input
        id="package-input"
        type="file"
        hidden
        onChange={onSelect}
        accept=".json"
      />

      <label
        htmlFor="package-input"
        id="drop_target"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        {...props}
      >
        Alternatively, <button type="button">select</button> or drop a{' '}
        <code>package.json</code> file here
      </label>
    </>
  );
}
