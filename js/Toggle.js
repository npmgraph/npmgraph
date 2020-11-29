import { html } from '/vendor/preact.js';

export default function({ checked = false, value = true, onChange, style, children, ...props }) {
  return html`
    <label style=${style} ...${props}>
      <div onClick=${() => onChange(checked ? false : value)} style=${{
          display: 'inline-block',
          width: '4em',
          backgroundColor: '#ccc',
          borderRadius: '.5em',
          marginRight: '.5em'
        }}>
        <div style=${{
          width: '3em',
          borderRadius: '.5em',
          textAlign: 'center',
          transition: '.15s',
          marginLeft: checked ? '0' : '1em',
          backgroundColor: checked ? '#090' : '#aaa',
          color: '#fff'
        }}>${checked ? 'On' : 'Off'}</div>
      </div>
      ${children}
    </label> `;
}