import RawLogo from '../images/logo.svg?react';
import * as styles from './Logo.module.scss';

export default function Logo() {
  return (
    <RawLogo
      viewBox="0 0 545.7 100"
      role="img"
      aria-label="npmgraph"
      className={styles.root}
    />
  );
}
