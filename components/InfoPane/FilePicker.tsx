import React from 'react';
import { readFile } from '../../lib/read_file.js';

function onSelect(ev: React.ChangeEvent<HTMLInputElement>) {
  const file = ev.target.files?.item(0);
  if (file) {
    readFile(file);
  }

  // Reset field
  ev.target.value = '';
}

export default function FilePicker({ label }: { label: string }) {
  return (
    <label className="link" style={{ display: 'inline' }}>
      {label}
      <input type="file" hidden onChange={onSelect} accept=".json" />
    </label>
  );
}
