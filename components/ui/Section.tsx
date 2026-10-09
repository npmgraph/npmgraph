import type { HTMLProps, ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';

import * as styles from './Section.module.scss';

export function CollapsibleSection({
  title,
  count,
  icon,
  className,
  children,
  open = true,
  ...props
}: {
  title: string;
  count?: number | string;
  icon?: ReactNode;
  open?: boolean;
} & HTMLProps<HTMLDetailsElement>) {
  return (
    <details open={open} {...props} className={cn(className, styles.root)}>
      <summary>
        {title}
        {icon}
        {count === undefined ? null : (
          <span className={styles.count}>{count}</span>
        )}
      </summary>
      {children}
    </details>
  );
}

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: any;
  className?: string;
}) {
  return (
    <div className={cn(className, styles.root)}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
