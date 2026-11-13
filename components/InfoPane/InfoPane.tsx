import type { HTMLProps } from 'react';
import { Pane } from '../ui/Pane.tsx';
import InputHelp from '../InputHelp.tsx';
import FilePicker from './FilePicker.tsx';
import * as styles from './InfoPane.module.css';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <InputHelp heading="npmgraph supports looking up:" />

      <p>It also accepts package.json:</p>
      <ul>
        <li>Drag and drop a file anywhere on the page</li>
        <li>Paste package.json (file or text)</li>
        <li>
          <FilePicker label="Choose file" /> from your computer
        </li>
      </ul>

      <hr />
      <footer className={styles.footer}>
        <a
          href="https://github.com/npmgraph/npmgraph"
          target="_blank"
          rel="noreferrer"
        >
          GitHub repo
        </a>
        <span aria-hidden="true">•</span>
        <a
          href="https://github.com/sponsors/broofa"
          target="_blank"
          rel="noreferrer"
        >
          Sponsor
        </a>
      </footer>
    </Pane>
  );
}
