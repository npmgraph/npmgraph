import FilePicker from './InfoPane/FilePicker.tsx';
import * as styles from './InputHelp.module.css';
import { QueryLink } from './ui/QueryLink.tsx';

const EXAMPLES = [
  ['express'],
  ['cross-env@6', 'rimraf'],
  ['sindresorhus/ora'],
];

export default function InputHelp() {
  return (
    <>
      <p>
        npmgraph supports looking up npm module names (multiple and versioned),
        GitHub repository shorthands, or package.json: drop or paste a file or
        text, <FilePicker label="choose a file" />, or enter a{' '}
        <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
          URL
        </QueryLink>
        .
      </p>
      <div className={styles.chips}>
        <span className={styles.label}>Try:</span>
        {EXAMPLES.map(query => (
          <QueryLink key={query.join()} className={styles.chip} query={query} />
        ))}
      </div>
    </>
  );
}
