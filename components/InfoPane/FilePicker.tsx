import { readFile } from '../../lib/read_file.ts';
import * as styles from './FilePicker.module.scss';

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
    <label className={styles.link} style={{ display: 'inline' }}>
      {label}
      <input type="file" hidden onChange={onSelect} accept=".json" />
    </label>
  );
}
