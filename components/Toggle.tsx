import React, { HTMLProps } from 'react';
import { cn } from '../lib/dom.js';
import './Toggle.scss';

export function Toggle({
  checked = false,
  onChange,
  style,
  children,
  className,
  ...props
}: HTMLProps<HTMLLabelElement> & {
  checked?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn('toggle', { checked }, className)}
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
