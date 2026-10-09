/**
Remember the results of the most recent calls, using the first argument as the
key. Meant for slow, pure functions like the graph layout.
*/
export default function memoizeRecent<
  Args extends [string, ...unknown[]],
  Result,
>(fn: (...args: Args) => Result, limit = 5) {
  if (limit < 1) {
    throw new RangeError('limit must be at least 1');
  }

  const cache = new Map<string, Result>();

  return (...args: Args): Result => {
    const [key] = args;
    if (cache.has(key)) {
      // Insert it again so the least recently used key is always the first one
      const cached = cache.get(key) as Result;
      cache.delete(key);
      cache.set(key, cached);
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);
    if (cache.size > limit) {
      cache.delete(cache.keys().next().value!);
    }

    return result;
  };
}
