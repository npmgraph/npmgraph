import { useEffect } from 'react';
import { PARAM_HIDE } from '../lib/constants.js';
import useHashParam from '../lib/useHashParam.js';
import { usePane } from './App/App.js';
import { PANE } from './Inspector.js';

// Ad-hoc code for handling keyboard shortcuts. If/when we need something more sophisticated, we should consider using a library like `mousetrap`.
export function useKeyboardShortcuts() {
  const [, setPane] = usePane();
  const [, setHide] = useHashParam(PARAM_HIDE);

  useEffect(() => {
    function handleKeyPress(ev: KeyboardEvent) {
      const { nodeName } = ev.target as HTMLElement;
      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') return;

      // Open inspector with "/"
      if (ev.key === '/') {
        setHide(false);
        setPane(PANE.INFO);
        ev.preventDefault();
      }
    }

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);
}
