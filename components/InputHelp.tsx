import * as styles from './InputHelp.module.css';
import { QueryLink } from './ui/QueryLink.tsx';

const EXAMPLES = [
  ['express'],
  ['cross-env@6', 'rimraf'],
  ['sindresorhus/type-fest'],
];

export default function InputHelp({
  heading = 'For example:',
}: {
  heading?: string;
}) {
  return (
    <>
      <p>{heading}</p>
      <ul className={styles.chips}>
        {EXAMPLES.map(query => (
          <li key={query.join()}>
            <QueryLink query={query} />
          </li>
        ))}
      </ul>
    </>
  );
}
