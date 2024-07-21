import React, { type HTMLProps } from 'react';

export function Tags({ children, style, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
