import copy from 'copy-text-to-clipboard';
import CopyIcon from '../../images/icons/copy.svg?react';
import { flash } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeMermaid } from '../../lib/graph-util.ts';
import { Button } from '../Button.tsx';

export default function GraphDiagramCopyButton() {
  const [graph] = useGlobalState('graph');

  return (
    <Button
      title="Copy textual representation of graph (Mermaid)"
      onClick={() => {
        if (copy(composeMermaid({ graph }))) {
          flash('Copied graph as text');
        } else {
          flash('Could not copy graph', 'error');
        }
      }}
    >
      <CopyIcon />
    </Button>
  );
}
