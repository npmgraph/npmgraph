import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.ts';
import * as styles from './Tab.module.scss';

export function Tab({
  active,
  badge,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  active: boolean;
  badge?: string | number | boolean;
}) {
  return (
    <div className={cn(styles.tab, { [styles.active]: active })} {...props}>
      <button type="button" className="bright-hover">
        {children}
        {badge && (
          <span className={styles.badge}>{badge === true ? ' ' : badge}</span>
        )}
      </button>
    </div>
  );
}
