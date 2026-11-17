import type { HTMLProps } from 'react';
import { Pane } from '../ui/Pane.tsx';
import { Group } from '../ui/Group.tsx';
import { InputDescription, InputExamples } from '../InputHelp.tsx';
import * as styles from './InfoPane.module.css';

export default function InfoPane(props: HTMLProps<HTMLDivElement>) {
  return (
    <Pane {...props}>
      <Group title="npmgraph">
        <InputDescription />
      </Group>
      <InputExamples />
      <Group title="Connect">
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
      </Group>
    </Pane>
  );
}
