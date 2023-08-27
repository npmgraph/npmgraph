import React, { HTMLProps } from 'react';

export function Tab({
  active,
  children,
  ...props
}: HTMLProps<HTMLDivElement> & { active: boolean }) {
  return (
    <div className={`tab bright-hover ${active ? 'active' : ''}`} {...props}>
      {children}
    </div>
  );
}
