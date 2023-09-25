import '/css/Components.scss';

import React, { HTMLProps } from 'react';

export function Toggle({
  checked = false,
  onChange,
  style,
  children,
  ...props
}: HTMLProps<HTMLLabelElement> & {
  checked?: boolean;
  onChange: () => void;
}) {
  return (
    <label style={style} {...props}>
      <div
        onClick={() => onChange()}
        style={{
          display: 'inline-block',
          width: '4em',
          backgroundColor: 'var(--bg2)',
          borderRadius: '.5em',
          marginRight: '.5em',
        }}
      >
        <div
          style={{
            width: '3em',
            borderRadius: '.5em',
            textAlign: 'center',
            transition: '.15s',
            marginLeft: checked ? '0' : '1em',
            backgroundColor: checked ? 'var(--bg-green)' : 'var(--bg1)',
          }}
        >
          {checked ? 'On' : 'Off'}
        </div>
      </div>
      {children}
    </label>
  );
}
