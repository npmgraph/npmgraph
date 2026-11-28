import type { ReactNode } from 'react';
import * as styles from './Stats.module.css';

export function Stats({ children }: { children: ReactNode }) {
  return <div className={styles.stats}>{children}</div>;
}

export function Stat({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.stat}>
      <strong>{children}</strong>
      <span>{label}</span>
    </div>
  );
}
