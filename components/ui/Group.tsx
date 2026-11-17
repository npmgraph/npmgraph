import type { ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';
import * as styles from './Group.module.css';

// A small label heading with centered (or left aligned) content below it
export function Group({
  title,
  align,
  children,
}: {
  title: string;
  align?: 'start';
  children: ReactNode;
}) {
  return (
    <div className={cn(styles.root, align === 'start' && styles.start)}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </div>
  );
}
