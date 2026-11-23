import pMemoize from 'p-memoize';
import HttpError from './HttpError.ts';
import type LoadActivity from './LoadActivity.ts';

type FetchInit = RequestInit & { silent?: boolean; timeout?: number };

let activity: LoadActivity;
export function setActivityForRequestCache(act: LoadActivity) {
  activity = act;
}

async function request(
  input: URL | string,
  init: FetchInit | undefined,
  traceError: Error,
): Promise<unknown> {
  const url = String(input);
  init = { ...init };

  if (init.timeout) {
    if (init.signal) {
      throw new Error('Cannot use timeout with signal');
    }

    // Abort request after `timeout`, while also respecting user-supplied `signal`
    init.signal = AbortSignal?.timeout(init.timeout);
  }

  const finish = init.silent
    ? () => {}
    : activity?.start(`Fetching ${decodeURIComponent(url)}`);

  try {
    const response = await fetch(input, init);
    if (response.ok) {
      return (await response.json()) as unknown;
    }

    const error = new HttpError(response.status);
    error.stack = traceError.stack;
    throw error;
  } catch (error) {
    const message = `Failed to get ${url}`;

    // `message` is read-only on DOMExceptions (e.g. timeouts and aborts)
    if (error instanceof Error && !(error instanceof DOMException)) {
      error.message = message;
      throw error;
    }

    throw new Error(message, { cause: error });
  } finally {
    finish?.();
  }
}

// Shares in-flight and finished requests. Failures are settled so they're cached too, not retried
const settledRequest = pMemoize(
  async (
    input: URL | string,
    init: FetchInit | undefined,
    traceError: Error,
  ) => {
    const [result] = await Promise.allSettled([
      request(input, init, traceError),
    ]);
    return result;
  },
  { cacheKey: ([input, init]) => `${input} ${JSON.stringify(init)}` },
);

// `fetch()` wrapper that returns parsed JSON and caches requests
export default async function fetchJson<T>(
  input: URL | string,
  init?: FetchInit,
): Promise<T> {
  // eslint-disable-next-line unicorn/error-message
  const traceError = new Error();

  // Requests with a signal aren't shared: aborting one would fail whoever gets it next
  if (init?.signal) {
    return request(input, init, traceError) as Promise<T>;
  }

  const result = await settledRequest(input, init, traceError);
  if (result.status === 'rejected') {
    throw result.reason as Error;
  }

  return result.value as T;
}
