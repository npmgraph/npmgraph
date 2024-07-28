import type { HTMLProps } from 'react';
import React from 'react';

export function Pane({ children, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div className="pane" {...props}>
      {children}
    </div>
  );
}
