import FilePicker from './InfoPane/FilePicker.tsx';
import * as styles from './InputHelp.module.css';
import { QueryLink } from './ui/QueryLink.tsx';

const EXAMPLES = [
  { query: ['express'], title: 'A single module name' },
  {
    query: ['cross-env@6', 'rimraf'],
    title: 'Multiple module names, with optional versions',
  },
  { query: ['sindresorhus/ora'], title: 'A GitHub repository reference' },
];

export function InputDescription({ isDim }: { isDim?: boolean }) {
  return (
    <p className={isDim ? styles.dim : undefined}>
      npmgraph supports looking up npm module names (multiple and versioned),
      GitHub repository shorthands, or package.json (drop or paste a file or
      text, or enter a{' '}
      <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
        URL
      </QueryLink>
      ). <FilePicker label="Choose file" /> from your computer.
    </p>
  );
}

export function InputExamples() {
  return (
    <div className={styles.examples}>
      <span className={styles.label}>Try</span>
      <div className={styles.chips}>
        {EXAMPLES.map(({ query, title }) => (
          <QueryLink
            key={query.join(',')}
            className={styles.chip}
            query={query}
            title={title}
          />
        ))}
      </div>
    </div>
  );
}
