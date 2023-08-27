import '/css/Components.scss';

import React, { HTMLProps } from 'react';

export function Toggle({
  checked = false,
  value = true,
  onChange,
  style,
  children,
  ...props
}: HTMLProps<HTMLLabelElement> & {
  checked?: boolean;
  value?: any;
  onChange: (value: any) => void;
}) {
  return (
    <label style={style} {...props}>
      <div
        onClick={() => onChange(checked ? false : value)}
        style={{
          display: 'inline-block',
          width: '4em',
          backgroundColor: '#ccc',
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
            backgroundColor: checked ? '#090' : '#aaa',
            color: '#fff',
          }}
        >
          {checked ? 'On' : 'Off'}
        </div>
      </div>
      {children}
    </label>
  );
}
