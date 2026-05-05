import type { HTMLProps } from 'react';
import { cn } from '../lib/dom.ts';
import styles from './Toggle.module.scss';

export function Toggle({
  checked = false,
  onChange,
  style,
  children,
  className,
  ...props
}: HTMLProps<HTMLLabelElement> & { checked?: boolean; onChange: () => void }) {
  return (
    <label
      className={cn(styles.toggle, { [styles.checked]: checked }, className)}
      style={style}
      {...props}
    >
      <div onClick={() => onChange()}>
        <div>{checked ? 'On' : 'Off'}</div>
      </div>
      {children}
    </label>
  );
}
