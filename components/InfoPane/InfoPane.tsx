import type { HTMLProps } from 'react';
import { Pane } from '../ui/Pane.tsx';
import InputHelp from '../InputHelp.tsx';
import { QueryLink } from '../ui/QueryLink.tsx';
import FilePicker from './FilePicker.tsx';
import * as styles from './InfoPane.module.css';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <p>
        npmgraph supports looking up a npm module name, multiple versioned
        module names, or a GitHub repository shorthand.
      </p>
      <InputHelp />

      <p>
        It also accepts package.json: drop or paste a file or text,{' '}
        <FilePicker label="choose a file" />, or enter a{' '}
        <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
          URL
        </QueryLink>
        .
      </p>

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
