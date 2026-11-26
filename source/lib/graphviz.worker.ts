import { Graphviz } from '@hpcc-js/wasm-graphviz';

const worker = globalThis as unknown as Worker;

// Listen right away: messages that arrive while graphviz is loading must not be lost
const graphviz = Graphviz.load();

async function render({ id, dot }: { id: number; dot: string }) {
  try {
    const instance = await graphviz;
    worker.postMessage({ id, svg: instance.dot(dot, 'svg') });
  } catch (error) {
    worker.postMessage({ id, error: String(error) });
  }
}

worker.addEventListener(
  'message',
  ({ data }: MessageEvent<{ id: number; dot: string }>) => {
    void render(data);
  },
);
