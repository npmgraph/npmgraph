import type { HTMLProps } from 'react';
import { cn } from '../../lib/dom.ts';
import * as styles from './Pane.module.scss';

export function Pane({
  centered,
  className,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & { centered?: boolean }) {
  return (
    <div
      className={cn(styles.pane, { [styles.centered]: centered }, className)}
      {...props}
    >
      {children}
    </div>
  );
}
