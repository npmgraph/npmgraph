import type { HTMLProps, ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';

import * as styles from './Section.module.scss';

function Count({ count }: { count?: number | string }) {
  return count === undefined ? null : (
    <span className={styles.count}>{count}</span>
  );
}

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
        <Count count={count} />
      </summary>
      {children}
    </details>
  );
}

export function Section({
  title,
  children,
  className,
  count,
}: {
  title: string;
  children: any;
  className?: string;
  count?: number | string;
}) {
  return (
    <div className={cn(className, styles.root)}>
      <h3>
        {title}
        <Count count={count} />
      </h3>
      {children}
    </div>
  );
}
