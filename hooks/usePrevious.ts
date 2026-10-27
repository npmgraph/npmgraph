import { useState } from 'react';

export default function usePrevious<T>(value: T | undefined) {
  const [state, setState] = useState<{
    value: T | undefined;
    prev?: T | undefined;
  }>({
    value,
  });
  if (!Object.is(state.value, value)) {
    setState({ value, prev: state.value });
  }

  return state.prev;
}
