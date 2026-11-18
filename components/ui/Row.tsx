import type { HTMLAttributes, HTMLProps, ReactNode } from 'react';
import type Module from '../../lib/Module.ts';
import { cn } from '../../lib/dom.ts';
import { Selectable } from './Selectable.tsx';
import * as styles from './Row.module.scss';

export function Rows({
  as: Tag = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: 'div' | 'dl' }) {
  return <Tag className={cn(styles.rows, className)} {...props} />;
}

export function Row({
  stacked,
  className,
  ...props
}: HTMLProps<HTMLDivElement> & { stacked?: boolean }) {
  return (
    <div
      className={cn(styles.row, { [styles.stacked]: stacked }, className)}
      {...props}
    />
  );
}

export function RowNote({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return <div className={cn(styles.note, className)} {...props} />;
}

export function ModuleRows({
  modules,
  bold,
  trailing,
}: {
  modules: Iterable<Module>;
  // Modules to highlight, e.g. the top level ones
  bold?: ReadonlySet<Module>;
  // Extra content at the end of each row
  trailing?: (module: Module) => ReactNode;
}) {
  return (
    <Rows>
      {[...modules].map(module => (
        <Row
          key={module.key}
          className={cn({ [styles.bold]: bold?.has(module) })}
        >
          <Selectable value={module.key} label={module.label} />
          {trailing?.(module)}
        </Row>
      ))}
    </Rows>
  );
}
