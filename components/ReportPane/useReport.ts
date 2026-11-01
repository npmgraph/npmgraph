import { useMemo } from 'react';
import type { Report } from './ReportItem.tsx';

/**
Builds the report once per `data`. Async reporters return a promise, which stays
the same on every render so it can be read with `use()`.
*/
export default function useReport<T>(
  data: T | undefined,
  reporter: (data: T) => Report,
): Report {
  return useMemo(
    // eslint-disable-next-line @typescript-eslint/promise-function-async -- Sync reporters must stay sync, and the promise must be the same on every render
    () => (data ? reporter(data) : undefined),
    [data, reporter],
  );
}
