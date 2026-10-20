import CopyIcon from '../../images/icons/copy.svg?react';
import useHashParam from '../../hooks/useHashParam.ts';
import { PARAM_SIZING } from '../../lib/constants.ts';
import { flash } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT } from '../../lib/graph-util.ts';
import { Button } from '../Button.tsx';

export default function GraphDiagramCopyButton() {
  const [graph] = useGlobalState('graph');
  const [sizing] = useHashParam(PARAM_SIZING);

  return (
    <Button
      title="Copy graph as Graphviz DOT text"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            composeDOT({ graph, sizing: sizing !== null }),
          );
          flash('Copied graph as text');
        } catch {
          flash('Could not copy graph', 'error');
        }
      }}
    >
      <CopyIcon />
    </Button>
  );
}
