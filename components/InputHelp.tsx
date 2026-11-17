import FilePicker from './InfoPane/FilePicker.tsx';
import * as styles from './InputHelp.module.css';
import { Group } from './ui/Group.tsx';
import { QueryLink } from './ui/QueryLink.tsx';

export function InputDescription({ isDim }: { isDim?: boolean }) {
  return (
    <p className={isDim ? styles.dim : undefined}>
      npmgraph supports looking up npm module names (multiple and versioned),
      GitHub repository shorthands, or package.json (drop or paste a file, or
      enter a{' '}
      <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
        URL
      </QueryLink>
      ). <FilePicker label="Choose file" /> from your computer.
    </p>
  );
}

export function InputExamples() {
  return (
    <Group title="Try">
      <div className={styles.chips}>
        <QueryLink
          className={styles.chip}
          query={['express']}
          title="A single module name"
        />
        <QueryLink
          className={styles.chip}
          query={['cross-env@6', 'rimraf']}
          title="Multiple module names, with optional versions"
        />
        <QueryLink
          className={styles.chip}
          query={['sindresorhus/ora']}
          title="A GitHub repository reference"
        />
      </div>
    </Group>
  );
}
