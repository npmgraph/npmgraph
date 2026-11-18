import GitHubCornerSvg from '../images/github-corner.svg?react';
import * as styles from './GitHubCorner.module.css';
// From https://tholman.com/github-corners/

export default function GitHubCorner() {
  return (
    <a
      href="https://github.com/npmgraph/npmgraph"
      className={styles.root}
      aria-label="View source on GitHub"
    >
      <GitHubCornerSvg />
    </a>
  );
}
