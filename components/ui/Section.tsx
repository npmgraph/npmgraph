import type { HTMLProps } from 'react';
import { cn } from '../../lib/dom.ts';

import * as styles from './Section.module.scss';

export function CollapsibleSection({
  title,
  className,
  children,
  open = true,
  ...props
}: { title: string; open?: boolean } & HTMLProps<HTMLDetailsElement>) {
  return (
    <>
      <hr />
      <details open={open} {...props} className={cn(className, styles.root)}>
        <summary>
          <span>{title || 'Untitled'}</span>
        </summary>
        {children}
      </details>
    </>
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
    <div className={className}>
      <hr />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
