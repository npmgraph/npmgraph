import React, { HTMLProps } from 'react';
import { cn } from '../lib/dom.js';
import './Tab.scss';

export function Tab({
  active,
  badge,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  active: boolean;
  badge?: string | number | boolean;
}) {
  return (
    <div className={cn('tab', { active })} {...props}>
      <button className="bright-hover">
        {children}
        {badge && <span className="badge">{badge === true ? ' ' : badge}</span>}
      </button>
    </div>
  );
}
