import React, { HTMLProps } from 'react';

export function Section({
  title,
  children,
  open = true,
}: { title: string; open?: boolean } & HTMLProps<HTMLDivElement>) {
  return (
    <details open={open}>
      <summary>{title || 'Untitled'}</summary>
      {children}
    </details>
  );
}
