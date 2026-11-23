import type { Graphviz } from '@hpcc-js/wasm-graphviz';
import { select } from 'd3-selection';
import { use, useEffect, type RefObject } from 'react';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { $, $$optional, $optional } from 'select-dom';
import useHashParam from '../../hooks/useHashParam.ts';
import { PARAM_SIZING } from '../../lib/constants.ts';
import { flashError } from '../../lib/flash.ts';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import { composeDOT, type GraphState } from '../../lib/graph-util.ts';
import type LoadActivity from '../../lib/LoadActivity.ts';
import memoizeRecent from '../../lib/memoizeRecent.ts';
import { getCachedModule } from '../../lib/ModuleCache.ts';
import svgDefs from './GraphDiagram.defs.svg?raw';
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

    // Safari doesn't make SVG links focusable on its own
    for (const link of $$optional('a', nodeElement)) {
      link.setAttribute('tabindex', '0');
    }

    if (module.package.deprecated) {
      nodeElement.classList.add('warning');
    }

    if (module.name) {
      nodeElement.dataset['module'] = module.key;
    } else {
      reportError(new Error(`Bad replace: ${key}`));
    }

    if (!isModuleVisible(module)) {
      nodeElement.classList.add('collapsed');
    }

    if (module.isStub) {
      nodeElement.classList.add('stub');
    }
  }
}

async function loadGraphviz() {
  const { Graphviz } = await import('@hpcc-js/wasm-graphviz');
  return Graphviz.load();
}

// Keep graphviz in a secondary bundle but load it eagerly
const graphvizPromise = loadGraphviz();

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
    flashError('Error while rendering graph');
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

  // Show the diagram at its natural size, the viewport handles zooming.
  // Note: Not using svg.getBBox() here because (for some reason???) it's
  // smaller than the actual bounding box
  const [width, height] =
    svgDom.getAttribute('viewBox')?.split(' ').slice(2) ?? [];
  if (width && height) {
    svgDom.setAttribute('width', width);
    svgDom.setAttribute('height', height);
  }

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
  transformRef: RefObject<ReactZoomPanPinchContentRef | null>,
) {
  const [graph] = useGlobalState('graph');
  const [sizing] = useHashParam(PARAM_SIZING);
  const graphviz = use(graphvizPromise);
  const [diagramElement, setDiagramElement] = useGlobalState('diagram');

  useEffect(() => {
    // Post-process rendered DOM
    const finish = activity.start('Rendering');

    // Signal other hooks that graph DOM has changed
    setDiagramElement(
      insertDiagram(
        composeSvgMarkup(graph, sizing !== null, graphviz),
        isModuleVisible,
      ),
    );

    // Fit the new graph in the view
    void transformRef.current?.fitToView({ maxScale: 1, animationTime: 0 });

    finish();
  }, [
    activity,
    graphviz,
    graph,
    isModuleVisible,
    setDiagramElement,
    sizing,
    transformRef,
  ]);

  return diagramElement;
}
