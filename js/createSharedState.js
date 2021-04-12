import { useState, useEffect } from 'react';
import EventEmitter from 'eventemitter3';

/**
 * A simpler, easier to use solution for sharing state across React
 * components.
 *
 * @param {Object} defaults
 * @returns {Object} Object with `use()` react-hook
 */
export default function createSharedState(defaults) {
  const state = new EventEmitter();

  return {
    use(key) {
      if (!(key in defaults)) throw Error(`Shared state ${key} not declared`);
      const [val, setVal] = useState(defaults[key]);

      useEffect(() => {
        state.on(key, setVal);
        return () => state.off(setVal);
      }, [val]);

      return [val, v => state.emit(key, v)];
    }
  };
}
