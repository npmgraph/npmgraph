import type { ReactNode } from 'react';
import * as styles from './Toolbar.module.css';

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className={styles.toolbar}>{children}</div>;
}

export function ToolbarSection({ children }: { children: ReactNode }) {
  return <div className={styles.section}>{children}</div>;
}
