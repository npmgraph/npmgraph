export function isPromise<T>(obj: Promise<T> | T): obj is Promise<T> {
  return obj instanceof Promise;
}
