// :facepalm: https://github.com/whatwg/dom/issues/981
export function createAbortable() {
  const signal = { aborted: false };

  return {
    signal,
    abort: () => {
      signal.aborted = true;
    },
  };
}
