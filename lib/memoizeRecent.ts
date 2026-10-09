// Placeholder until the tests are in place: doesn't remember anything yet
export default function memoizeRecent<
  Args extends [string, ...unknown[]],
  Result,
>(fn: (...args: Args) => Result, limit = 5) {
  if (limit < 1) {
    throw new RangeError('limit must be at least 1');
  }

  return fn;
}
