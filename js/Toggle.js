import { html } from '../vendor/preact.js';

export default function({ checked = false, onChange, style, ...props }) {
  return html`<div style=${{
      display: 'inline-block',
      width: '4em',
      backgroundColor: '#ccc',
      borderRadius: '.5em',
      ...style
    }} onClick=${() => onChange(!checked)}>
    <div style=${{
      width: '3em',
      borderRadius: '.5em',
      textAlign: 'center',
      transition: '.15s',
      marginLeft: checked ? '0' : '1em',
      backgroundColor: checked ? '#090' : '#aaa',
      color: '#fff'
    }}>${checked ? 'On' : 'Off'}</div>
  </div>`;
}