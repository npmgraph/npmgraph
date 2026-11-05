import type { HTMLProps } from 'react';
import { ExternalLink } from '../ui/ExternalLink.tsx';
import { Pane } from '../ui/Pane.tsx';
import InputHelp from '../InputHelp.tsx';
import FilePicker from './FilePicker.tsx';
import ErrorsBox from './ErrorsBox.tsx';
import * as styles from './InfoPane.module.scss';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <ErrorsBox />

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
        <ExternalLink href="https://github.com/npmgraph/npmgraph">
          GitHub repo
        </ExternalLink>
        <ExternalLink href="https://github.com/sponsors/broofa">
          Sponsor
        </ExternalLink>
      </footer>
    </Pane>
  );
}
