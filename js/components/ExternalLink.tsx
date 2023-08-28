import React, { HTMLProps } from 'react';

export function ExternalLink({
  href,
  children,
  target = '_blank',
  className,
  ...props
}: HTMLProps<HTMLAnchorElement> & { className?: string }) {
  return (
    <a
      href={href}
      className={`bright-hover ${className ?? ''}`}
      target={target}
      {...props}
    >
      {children}
      <span className="material-icons">open_in_new</span>
    </a>
  );
}
