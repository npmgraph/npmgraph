// Remove the item if the array contains it, otherwise append it
export function toggleItem<T>(array: readonly T[], item: T): T[] {
  return array.includes(item)
    ? array.filter(value => value !== item)
    : [...array, item];
}

// Turn "a, b,,c" into ['a', 'b', 'c']
export function parseCommaList(value?: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}
