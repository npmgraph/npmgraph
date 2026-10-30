import type { HTMLProps, ReactNode } from 'react';
import { cn } from '../../lib/dom.ts';
import useSectionTarget, { sectionName } from '../../hooks/useSectionTarget.ts';

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
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDetailsElement>(name);

  return (
    <details
      ref={ref}
      open={open}
      {...props}
      className={cn(className, styles.root)}
    >
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
  const name = sectionName(title);
  const ref = useSectionTarget<HTMLDivElement>(name);

  return (
    <div ref={ref} className={cn(className, styles.root)}>
      <h3>
        {title}
        <Count count={count} />
      </h3>
      {children}
    </div>
  );
}
