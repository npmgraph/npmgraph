import { PackageJSON, PackumentVersion } from '@npm/types';
import React, { HTMLProps, useEffect } from 'react';
import {
  cacheLocalPackage,
  sanitizePackageKeys,
} from '../../lib/ModuleCache.js';
import {
  PARAM_PACKAGES,
  PARAM_QUERY,
  UNNAMED_PACKAGE,
} from '../../lib/constants.js';
import { flash } from '../../lib/flash.js';
import { hashSet, searchSet } from '../../lib/url_util.js';
import { patchLocation } from '../../lib/useLocation.js';
import './FileUploadControl.scss';

export default function FileUploadControl(props: HTMLProps<HTMLLabelElement>) {
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
  function onDrop(ev: React.DragEvent<HTMLElement>) {
    const target = ev.currentTarget;
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

  function loadJson(json: string, filename = 'Pasted content'): void {
    // Parse module and insert into cache
    let pkg: PackageJSON;
    try {
      pkg = JSON.parse(json);
    } catch (err) {
      flash(`${filename} is not a valid JSON file`);
      return;
    }

    // Sanitize package contents *immediately*, so we don't risk propagating
    // possibly-sensitive fields user may have in their package.json
    pkg = sanitizePackageKeys(pkg);

    pkg.name ??= UNNAMED_PACKAGE;

    const module = cacheLocalPackage(pkg as PackumentVersion);

    // Set query, and attach package contents in hash
    const url = new URL(location.href);
    url.hash = '';
    const hash = hashSet(PARAM_PACKAGES, JSON.stringify([pkg]), url);
    const search = searchSet(PARAM_QUERY, module.key, url);
    patchLocation({ hash, search }, false);
  }

  function onPaste(ev: ClipboardEvent) {
    const items = ev.clipboardData?.items;
    if (!items) return;

    // Exclude pastes in input fields
    if (document.activeElement?.tagName === 'INPUT') return;

    for (const item of items) {
      if (item.type === 'text/plain') {
        item.getAsString(content => {
          loadJson(content, 'Pasted content');
        });
      }
    }
  }

  async function readFile(file: File) {
    const content = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });

    loadJson(content, file.name);
  }

  function onDragOver(ev: React.DragEvent<HTMLElement>) {
    const target = ev.currentTarget;
    target.classList.add('drag');
    ev.preventDefault();
  }

  function onDragLeave(ev: React.DragEvent<HTMLElement>) {
    const currentTarget = ev.currentTarget;
    currentTarget.classList.remove('drag');
    ev.preventDefault();
  }

  useEffect(() => {
    document.addEventListener('paste', onPaste);

    return () => {
      document.removeEventListener('paste', onPaste);
    };
  }, []);

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
