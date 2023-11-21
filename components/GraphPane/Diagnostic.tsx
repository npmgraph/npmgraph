import React from 'react';

export function Diagnostic({
  message,
}: { message: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div>
      <span style={{ color: 'var(--stroke-orange)', marginRight: '1em' }}>
        {'\u{26a0}'}
      </span>
      {message}
    </div>
  );
}
