import type { HTMLAttributes, HTMLProps } from 'react';
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
  striped,
  className,
  ...props
}: HTMLProps<HTMLDivElement> & { stacked?: boolean; striped?: boolean }) {
  return (
    <div
      className={cn(
        styles.row,
        { [styles.stacked]: stacked, [styles.striped]: striped },
        className,
      )}
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
}: {
  modules: Iterable<Module>;
  // Modules to highlight, e.g. the top level ones
  bold?: ReadonlySet<Module>;
}) {
  return (
    <Rows>
      {[...modules].map(module => (
        <Row
          striped
          key={module.key}
          className={cn({ [styles.bold]: bold?.has(module) })}
        >
          <Selectable value={module.key} label={module.label} />
        </Row>
      ))}
    </Rows>
  );
}
