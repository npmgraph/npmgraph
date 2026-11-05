import type { HTMLProps } from 'react';
import type Module from '../../lib/Module.ts';
import { cn } from '../../lib/dom.ts';
import { Selectable } from './Selectable.tsx';
import * as styles from './Row.module.scss';

export function Rows({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return <div className={cn(styles.rows, className)} {...props} />;
}

export function Row({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return <div className={cn(styles.row, className)} {...props} />;
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
          key={module.key}
          className={cn({ [styles.bold]: bold?.has(module) })}
        >
          <Selectable value={module.key} label={module.label} />
        </Row>
      ))}
    </Rows>
  );
}
