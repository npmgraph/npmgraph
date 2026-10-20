import CopyIcon from '../../images/icons/copy.svg?react';
import { flash } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT, type GraphState } from '../../lib/graph-util.ts';
import { Button } from '../Button.tsx';

// Fallback for when the async Clipboard API rejects (e.g. NotAllowedError)
function didLegacyCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  try {
    return document.execCommand('copy'); // eslint-disable-line @typescript-eslint/no-deprecated -- Fallback
  } finally {
    textarea.remove();
  }
}

async function copyGraph(graph: GraphState) {
  const text = composeDOT({ graph });
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!didLegacyCopy(text)) {
      flash('Could not copy graph', 'error');
      return;
    }
  }

  flash('Copied graph as text');
}

export default function GraphDiagramCopyButton() {
  const [graph] = useGlobalState('graph');

  return (
    <Button
      title="Copy graph as Graphviz DOT text"
      onClick={() => {
        void copyGraph(graph);
      }}
    >
      <CopyIcon />
    </Button>
  );
}
