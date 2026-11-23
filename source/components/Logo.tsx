import RawLogo from '../images/logo.svg?react';
import * as styles from './Logo.module.scss';

export default function Logo() {
  return <RawLogo role="img" aria-label="npmgraph" className={styles.root} />;
}
