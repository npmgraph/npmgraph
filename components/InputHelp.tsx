import * as styles from './InputHelp.module.css';
import { QueryLink } from './ui/QueryLink.tsx';

const EXAMPLES = [
  ['express'],
  ['cross-env@6', 'rimraf'],
  ['sindresorhus/type-fest'],
];

export default function InputHelp() {
  return (
    <div className={styles.chips}>
      <span className={styles.label}>Try:</span>
      {EXAMPLES.map(query => (
        <QueryLink key={query.join()} className={styles.chip} query={query} />
      ))}
    </div>
  );
}
