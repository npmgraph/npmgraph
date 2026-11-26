import { useEffect, type DependencyList } from 'react';

/**
Like `useEffect`, but the callback is async and receives an `AbortSignal`
that is aborted when the effect is cleaned up (before the next run or on unmount).
*/
export default function useAsyncEffect(
  effect: (signal: AbortSignal) => Promise<void>,
  deps: DependencyList,
) {
  useEffect(() => {
    const controller = new AbortController();
    void effect(controller.signal);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` are the caller's
  }, deps);
}
