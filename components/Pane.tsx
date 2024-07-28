import React, { HTMLProps } from 'react';

export function Pane({ children, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div className="pane" {...props}>
      {children}
    </div>
  );
}
