import * as styles from './InputHelp.module.css';
import { QueryLink } from './ui/QueryLink.tsx';

const EXAMPLES = [
  ['express'],
  ['cross-env@6', 'rimraf'],
  ['sindresorhus/type-fest'],
];

export default function InputHelp() {
  return (
    <ul className={styles.chips}>
      <li className={styles.label}>Try:</li>
      {EXAMPLES.map(query => (
        <li key={query.join()}>
          <QueryLink className={styles.chip} query={query} />
        </li>
      ))}
    </ul>
  );
}
