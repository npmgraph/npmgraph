export type SelectionTarget = 'module' | 'graph';

// Where to look at a new selection so that picking it always has a visible effect.
// The graph shows any selection, but only the Module tab shows a single module in detail.
export function getSelectionTarget({
  count,
  isGraphShown,
  inspect,
}: {
  // How many modules the selection matches
  count: number;
  isGraphShown: boolean;
  // The pick was meant to look at the module (e.g. a click in the graph), not just to highlight it
  inspect: boolean;
}): SelectionTarget | undefined {
  if (count === 1 && (inspect || !isGraphShown)) {
    return 'module';
  }

  if (!isGraphShown && count > 1) {
    return 'graph';
  }

  return undefined;
}
