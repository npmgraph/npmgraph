import type { HTMLProps } from 'react';
import { Pane } from '../ui/Pane.tsx';
import { InputDescription, InputExamples } from '../InputHelp.tsx';
import * as styles from './InfoPane.module.css';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <div className={styles.group}>
        <h3>npmgraph</h3>
        <InputDescription />
      </div>
      <div className={styles.examples}>
        <InputExamples />
      </div>
      <footer className={styles.footer}>
        <h3>Connect</h3>
        <div className={styles.links}>
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
        </div>
      </footer>
    </Pane>
  );
}
