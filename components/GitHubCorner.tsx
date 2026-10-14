import GitHubCornerSvg from '../images/github-corner.svg?react';
import * as styles from './GitHubCorner.module.scss';
// From https://tholman.com/github-corners/

export default function GitHubCorner() {
  return (
    <a
      href="https://github.com/npmgraph/npmgraph"
      className={styles.root}
      aria-label="View source on GitHub"
    >
      {/* svgo.config.json removes the viewBox of the file */}
      <GitHubCornerSvg viewBox="0 0 250 250" />
    </a>
  );
}
