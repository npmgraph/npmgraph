import QueryInput from './InfoPane/QueryInput.tsx';
import Logo from './Logo.tsx';
import * as styles from './AppHeader.module.scss';
import type { HTMLProps } from 'react';

export default function AppHeader({className = ''}: HTMLProps<HTMLAnchorElement>) {
  return (
    <div className={[styles.root, className].join(' ')}>
      <Logo />
      <QueryInput className={styles.input} />
    </div>
  );
}
