import type { Graphviz } from '@hpcc-js/wasm-graphviz';
import { select } from 'd3-selection';
import svgDefs from './GraphDiagram.defs.svg?raw';
import { use, useEffect, useState } from 'react';
import { $, $$optional, $optional } from 'select-dom';
import useHashParam from '../../hooks/useHashParam.ts';
import { report } from '../../lib/bugsnag.ts';
import { PARAM_SIZING } from '../../lib/constants.ts';
import { createAbortable } from '../../lib/createAbortable.ts';
import { flash } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT, type GraphState } from '../../lib/graph-util.ts';
import type LoadActivity from '../../lib/LoadActivity.ts';
import memoizeRecent from '../../lib/memoizeRecent.ts';
import { getCachedModule } from '../../lib/ModuleCache.ts';
import * as styles from './GraphDiagram.module.scss';

function getDiagramElement() {
  return $optional<SVGSVGElement>(`.${styles.graphDiagram}`);
}

function decorateGraphNodes(
  element: Element,
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  for (const nodeElement of $$optional('g.node', element)) {
    const key = $optional(':scope > title', nodeElement)?.textContent!.trim();
    if (!key) {
      continue;
    }

    const module = getCachedModule(key);
    if (!module) {
      continue;
    }

    nodeElement.setAttribute('role', 'button');
    nodeElement.setAttribute('tabindex', '0');
    nodeElement.setAttribute('aria-label', `Select ${module.key}`);

    if (module.package.deprecated) {
      nodeElement.classList.add('warning');
    }

    if (module.name) {
      nodeElement.dataset['module'] = module.key;
    } else {
      report.warn(new Error(`Bad replace: ${key}`));
    }

    if (!isModuleVisible(module)) {
      nodeElement.classList.add('collapsed');
    }

    if (module.isStub) {
      nodeElement.classList.add('stub');
    }
  }
}

// Keep graphviz in a secondary bundle but load it eagerly
const graphvizPromise = (async () => {
  const { Graphviz } = await import('@hpcc-js/wasm-graphviz');
  return Graphviz.load();
})();

// Layout is slow, so remember the latest ones (e.g. when going back to the Graph tab)
const layout = memoizeRecent((dot: string, graphviz: Graphviz) =>
  graphviz.dot(dot, 'svg'),
);

// Compose the SVG markup of the graph
function composeSvgMarkup(
  graph: GraphState,
  hasSizing: boolean,
  graphviz: Graphviz,
) {
  if (graph.moduleInfos.size === 0) {
    return '<svg />';
  }

  const dotDoc = composeDOT({ graph, sizing: hasSizing });

  try {
    return layout(dotDoc, graphviz);
  } catch (error) {
    console.error(error);
    flash('Error while rendering graph');
    return '<svg />';
  }
}

// Replace the diagram in the DOM with the SVG markup
function insertDiagram(
  svgMarkup: string,
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  // Parse markup
  const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    .firstElementChild as SVGSVGElement;
  svgDom.remove();

  // Remove background element so page background shows thru
  $optional('.graph > polygon', svgDom)?.remove();
  svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svgDom.classList.add(styles.graphDiagram);

  // Inject into DOM
  const element = $(`.${styles.graph}`);
  getDiagramElement()?.remove();
  element.append(svgDom);

  // Inject SVG definitions: warning pattern and collapsed-node outline
  select(`.${styles.graph} svg`).insert('defs', ':first-child').html(svgDefs);

  decorateGraphNodes(element, isModuleVisible);

  return getDiagramElement();
}

// Render the graph as SVG in the DOM, and return the SVG element
export default function useRenderDiagram(
  activity: LoadActivity,
  isModuleVisible: ({ name }: { name: string }) => boolean,
) {
  const [graph] = useGlobalState('graph');
  const [sizing] = useHashParam(PARAM_SIZING);
  const graphviz = use(graphvizPromise);
  const [diagramElement, setDiagramElement] = useState<
    SVGSVGElement | undefined
  >(getDiagramElement);

  useEffect(() => {
    const { signal, abort } = createAbortable();

    // Post-process rendered DOM
    const finish = activity.start('Rendering');

    // Render SVG markup (async)
    (async function () {
      // Check after all async stuff
      if (signal.aborted) {
        return;
      }

      // Signal other hooks that graph DOM has changed
      setDiagramElement(
        insertDiagram(
          composeSvgMarkup(graph, sizing !== null, graphviz),
          isModuleVisible,
        ),
      );

      finish?.();
    })();

    return () => {
      finish();
      abort();
    };
  }, [activity, graphviz, graph, isModuleVisible, sizing]);

  return diagramElement;
}
