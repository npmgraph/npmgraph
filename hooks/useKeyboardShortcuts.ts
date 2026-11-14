import { useEffect } from 'react';
import { SEARCH_FIELD_ID } from '../lib/constants.ts';

function handleKeyPress(ev: KeyboardEvent) {
  const { nodeName } = ev.target as HTMLElement;
  // Focus search field with "/", unless typing in a field
  if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || ev.key !== '/') {
    return;
  }

  ev.preventDefault();
  document.getElementById(SEARCH_FIELD_ID)?.focus();
}

// Focus the search field with Cmd/Ctrl+F, instead of the browser's find
function handleKeyDown(ev: KeyboardEvent) {
  const field = document.getElementById(SEARCH_FIELD_ID);
  if (
    !(field instanceof HTMLInputElement) ||
    !(ev.metaKey || ev.ctrlKey) ||
    ev.altKey ||
    ev.shiftKey ||
    ev.key.toLowerCase() !== 'f'
  ) {
    return;
  }

  ev.preventDefault();
  field.focus();
  field.select();
}

// Ad-hoc code for handling keyboard shortcuts. If/when we need something more sophisticated, we should consider using a library like `mousetrap`.
export function useKeyboardShortcuts() {
  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
