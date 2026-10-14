// Remove the item if the array contains it, otherwise append it
export function toggleItem<T>(array: readonly T[], item: T): T[] {
  return array.includes(item)
    ? array.filter(value => value !== item)
    : [...array, item];
}
