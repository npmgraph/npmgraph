import { useMemo } from 'react';

/**
Calls `load` once per `key` and returns the same promise on every render, so it
can be passed to a child that reads it with `use()`.
*/
// eslint-disable-next-line @typescript-eslint/promise-function-async -- It must return the same promise on every render
export default function usePromise<T>(key: unknown, load: () => Promise<T>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/promise-function-async -- `key` identifies the promise, and it can't be wrapped in an async function
  return useMemo(() => load(), [key]);
}
