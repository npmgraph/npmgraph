import FilePicker from './InfoPane/FilePicker.tsx';
import * as styles from './InputHelp.module.css';
import { QueryLink } from './ui/QueryLink.tsx';

const EXAMPLES = [['express'], ['cross-env@6', 'rimraf'], ['sindresorhus/ora']];

export default function InputHelp({ variant }: { variant?: 'hero' }) {
  const isHero = variant === 'hero';
  const description = (
    <p className={isHero ? styles.dim : undefined}>
      npmgraph supports looking up npm module names (multiple and versioned),
      GitHub repository shorthands, or package.json (drop or paste a file or
      text, or enter a{' '}
      <QueryLink query="https://github.com/npmgraph/npmgraph/blob/main/package.json">
        URL
      </QueryLink>
      ). <FilePicker label="Choose file" /> from your computer.
    </p>
  );
  const examples = (
    <div className={styles.examples}>
      <span className={styles.label}>Try</span>
      <div className={styles.chips}>
        {EXAMPLES.map(query => (
          <QueryLink
            key={query.join(',')}
            className={styles.chip}
            query={query}
          />
        ))}
      </div>
    </div>
  );

  return isHero ? (
    <>
      {examples}
      {description}
    </>
  ) : (
    <>
      {description}
      {examples}
    </>
  );
}
