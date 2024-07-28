export type PromiseWithResolversType<T> = {
  promise: Promise<T>;
  resolve: (value: T | Promise<T>) => void;
  reject: (reason?: unknown) => void;
};

export default function <T>() {
  let resolve!: (value: T | Promise<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
