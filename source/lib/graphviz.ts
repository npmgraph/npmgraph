import memoizeRecent from './memoizeRecent.ts';

type Response = { id: number; svg: string } | { id: number; error: string };

// Layout is slow and blocks the thread, so it runs in a worker that starts loading right away
const worker = new Worker(new URL('graphviz.worker.ts', import.meta.url), {
  type: 'module',
});

let lastId = 0;
const pending = new Map<number, PromiseWithResolvers<string>>();

worker.addEventListener('message', ({ data }: MessageEvent<Response>) => {
  const request = pending.get(data.id)!;
  pending.delete(data.id);
  if ('error' in data) {
    request.reject(new Error(data.error));
  } else {
    request.resolve(data.svg);
  }
});

worker.addEventListener('error', event => {
  for (const request of pending.values()) {
    request.reject(new Error(event.message));
  }

  pending.clear();
});

// Layout is slow, so remember the latest ones (e.g. when going back to the Graph tab)
export const layout = memoizeRecent(async (dot: string) => {
  const id = lastId++;
  const request = Promise.withResolvers<string>();
  pending.set(id, request);
  worker.postMessage({ id, dot });
  return request.promise;
});
