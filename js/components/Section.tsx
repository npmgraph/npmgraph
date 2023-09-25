import React, { HTMLProps } from 'react';

export function Section({
  title,
  children,
  open = true,

  ...props
}: { title: string; open?: boolean } & HTMLProps<HTMLDetailsElement>) {
  return (
    <details open={open} {...props}>
      <summary>{title || 'Untitled'}</summary>
      {children}
    </details>
  );
}
