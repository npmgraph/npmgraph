import type { ReactNode } from 'react';
import * as styles from './Group.module.css';

// A small label heading with centered content below it
export function Group({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </div>
  );
}
