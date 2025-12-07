import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { select } from 'd3-selection';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { $, $$ } from 'select-dom';
import { useGlobalState } from '../../lib/GlobalStore.js';
import type LoadActivity from '../../lib/LoadActivity.js';
import type Module from '../../lib/Module.js';
import {
  getCachedModule,
  queryModuleCache,
  QueryType,
} from '../../lib/ModuleCache.js';
import { report } from '../../lib/bugsnag.js';
import {
  PANE,
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_HIDE,
  PARAM_SIZING,
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.js';
import { createAbortable } from '../../lib/createAbortable.js';
import { celebrate, flash } from '../../lib/flash.js';
import useCollapse from '../../lib/useCollapse.js';
import useGraphSelection from '../../lib/useGraphSelection.js';
import useHashParam from '../../lib/useHashParam.js';
import usePrevious from '../../lib/usePrevious.js';
import { useQuery } from '../../lib/useQuery.js';
import {
  getColorizer,
  isSimpleColorizer,
} from '../GraphPane/colorizers/index.js';
import './GraphDiagram.scss';
import GraphDiagramDownloadButton from './GraphDiagramDownloadButton.js';
import { GraphDiagramZoomButtons } from './GraphDiagramZoomButtons.js';
import type { DependencyKey, GraphState } from './graph_util.js';
import {
  composeDOT,
  gatherSelectionInfo,
  getDiagramElement,
  getGraphForQuery,
} from './graph_util.js';

export type ZoomOption =
  | typeof ZOOM_NONE
  | typeof ZOOM_FIT_WIDTH
  | typeof ZOOM_FIT_HEIGHT;

const idSeen = new Set<unknown>();

export default function GraphDiagram({ activity }: { activity: LoadActivity }) {
  const [query] = useQuery();
  const [depTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [, setPane] = useGlobalState('pane');
  const [, setZenMode] = useHashParam(PARAM_HIDE);
  const [selectType, selectValue, setGraphSelection] = useGraphSelection();
  const [graph, setGraph] = useGlobalState('graph');
  const [diagramElement, setDiagramElement] = useState<
    SVGSVGElement | undefined
  >(getDiagramElement);

  const [collapse, setCollapse] = useCollapse();
  const [colorize] = useHashParam(PARAM_COLORIZE);
  const [zoom] = useHashParam(PARAM_ZOOM);
  const [sizing] = useHashParam(PARAM_SIZING);
  const [graphviz, graphvizLoading] = useGraphviz();

  // Stable query array for use in effects
  const sortedQuery = useMemo(() => [...query].sort(), [query]);

  // Stable dependency types for use in effects
  const dependencyTypes = useMemo(() => {
    const extra = (depTypes ?? '')
      .split(/\s*,\s*/)
      .map(s => s.trim())
      .filter(Boolean)
      .sort() as DependencyKey[];
    return new Set<DependencyKey>(['dependencies', ...extra]);
  }, [depTypes]);

  async function handleGraphClick(event: React.MouseEvent) {
    if (
      !(event.target instanceof Element) ||
      event.target.closest('#graph-controls')
    ) {
      return;
    }

    if (event.metaKey) {
      // Allow opening the link in a new tab
      return;
    }

    const node = event.target.closest('g.node');
    if (node) {
      // Don't navigate to link
      event.preventDefault();
    }

    const moduleKey = node ? $('title', node)?.textContent?.trim() : '';
    const module = moduleKey ? getCachedModule(moduleKey) : undefined;

    // Toggle exclude filter?
    if (node && event.shiftKey) {
      if (module) {
        const isIncluded = collapse.includes(module.name);
        if (isIncluded) {
          setCollapse(collapse.filter(n => n !== module.name));
        } else {
          setCollapse([...collapse, module.name]);
        }
      }

      return;
    }

    if (node) setZenMode('');

    setGraphSelection(QueryType.Default, moduleKey);
    if (moduleKey) {
      setPane(PANE.MODULE);
    }
  }

  function applyZoom() {
    const graphEl = $('div#graph')!;
    if (!diagramElement) return;

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = diagramElement.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) return;

    const [, , w, h] = vb;
    graphEl.classList.toggle(
      'centered',
      zoom === ZOOM_NONE && w < graphEl.clientWidth && h < graphEl.clientHeight,
    );

    switch (zoom) {
      case ZOOM_NONE:
        diagramElement.setAttribute('width', String(w));
        diagramElement.setAttribute('height', String(h));
        break;

      case ZOOM_FIT_WIDTH:
        diagramElement.setAttribute('width', '100%');
        diagramElement.removeAttribute('height');
        break;

      case ZOOM_FIT_HEIGHT:
        diagramElement.removeAttribute('width');
        diagramElement.setAttribute('height', '100%');
        break;
    }
  }

  // Filter for which modules should be shown / collapsed in the graph
  const moduleFilter = useCallback(
    ({ name }: { name: string }) => !collapse?.includes(name),
    [collapse],
  );

  // NOTE: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.
  // Effect: Fetch modules
  useEffect(() => {
    const { signal, abort } = createAbortable();
    getGraphForQuery(sortedQuery, dependencyTypes, moduleFilter).then(
      newGraph => {
        if (signal.aborted) return; // Check after async

        const firstInfo = newGraph.moduleInfos.values().next().value;
        if (newGraph?.moduleInfos.size === 1 && !firstInfo?.module.isStub) {
          celebrate('Zero dependencies for the win!');
        }

        setGraph(newGraph);
      },
    );

    return abort;
  }, [sortedQuery, dependencyTypes, collapse, moduleFilter, setGraph]);

  // Effect: Insert SVG markup into DOM
  useEffect(() => {
    const { signal, abort } = createAbortable();

    // Post-process rendered DOM
    const finish = activity.start('Rendering');

    // Render SVG markup (async)
    (async function () {
      if (!graphviz) return;

      if (signal.aborted) return; // Check after all async stuff

      // Compose SVG markup
      let svgMarkup = '<svg />';
      if (graph?.moduleInfos?.size) {
        const dotDoc = composeDOT({ graph, sizing: sizing !== null });

        try {
          svgMarkup = graph?.moduleInfos.size
            ? await graphviz.dot(dotDoc, 'svg')
            : '<svg />';
        } catch (err) {
          console.error(err);
          flash('Error while rendering graph');
        }
      }
      if (signal.aborted) return; // Check after all async stuff

      // Parse markup
      const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
        .children[0] as SVGSVGElement;
      svgDom.remove();

      // Remove background element so page background shows thru
      svgDom.querySelector('.graph > polygon')?.remove();
      svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgDom.id = 'graph-diagram';

      // Inject into DOM
      const el = $('#graph')!;
      getDiagramElement()?.remove();
      el.appendChild(svgDom);

      // Inject bg pattern for deprecated modules
      const PATTERN = `<pattern id="warning"
        width="12" height="12"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45 50 50)">
        <line class="line0" stroke-width="6px" x1="3" x2="3" y2="12"/>
        <line class="line1" stroke-width="6px" x1="9" x2="9" y2="12"/>
        </pattern>`;

      select('#graph svg').insert('defs', ':first-child').html(PATTERN);

      // Decorate DOM nodes with appropriate classname
      for (const el of $$('#graph g.node')) {
        // Find module this node represents
        const key = $('text', el)!.textContent;
        if (!key) continue;

        const m = getCachedModule(key);

        if (!m) continue;

        if (m?.package.deprecated) {
          el.classList.add('warning');
        }

        if (m.name) {
          el.dataset.module = m.key;
        } else {
          report.warn(new Error(`Bad replace: ${key}`));
        }

        if (!moduleFilter(m)) {
          el.classList.add('collapsed');
        }

        if (m.isStub) {
          el.classList.add('stub');
        }
      }

      // Signal other hooks that graph DOM has changed
      setDiagramElement(getDiagramElement());

      finish?.();
    })();

    return () => {
      finish();
      abort();
    };
  }, [activity, graphviz, graph, moduleFilter, sizing]);

  // (Re)apply zoom if/when it changes
  useEffect(applyZoom, [zoom, diagramElement]);

  const selectedModules = useMemo(() => {
    if (!graph) return new Map<string, Module>();
    return queryModuleCache(selectType, selectValue);
  }, [graph, selectType, selectValue]);
  const previousSelection = usePrevious(selectedModules);
  // Effect: render graph selection
  useEffect(() => {
    if (!graph) return;
    updateSelection(
      graph,
      selectedModules,
      selectedModules.size > 0 || (previousSelection?.size ?? 0) === 0,
    );
  }, [diagramElement, graph, selectedModules, previousSelection]);

  // Effect: Colorize nodes
  useEffect(() => {
    if (!diagramElement) return;
    colorizeGraph(diagramElement, colorize ?? '');
  }, [colorize, diagramElement]);

  if (!graphviz) {
    if (graphvizLoading) {
      return (
        <div id="graph" className="graphviz-loading">
          {graphvizLoading
            ? 'Loading layout package...'
            : 'Layout package failed to load.'}
        </div>
      );
    }
  }

  return (
    <div id="graph" onClick={handleGraphClick}>
      <div id="graph-controls">
        <GraphDiagramZoomButtons />
        <GraphDiagramDownloadButton />
      </div>
    </div>
  );
}

// Debug helper for logging when a react variable changes
// eslint-disable-next-line unused-imports/no-unused-vars
function logUpdate(name: string, val: unknown) {
  if (!val) {
    if (!idSeen.has(name)) {
      console.log(name, '<undefined>');
      idSeen.add(name);
    }
    return;
  }
  if (idSeen.has(val)) return;
  idSeen.add(val);
  console.log(name, 'updated ->', val);
}

function scrollGraphIntoView(
  el: Element | null,
  scrollOptions?: ScrollToOptions,
) {
  const graphEl = document.querySelector('#graph');
  if (graphEl && el) {
    // Bug: graphEl.scrollIntoView() doesn't work for SVG elements in
    // Firefox.  And even in Chrome it just scrolls the element to *barely*
    // be in view, which isn't really what we want.  (We'd like element to
    // be centered in the view.)  So, instead, we manually compute the
    // scroll coordinates.
    const { top: elTop, left: elLeft } = el.getBoundingClientRect();
    const left = graphEl.scrollLeft + elLeft - graphEl.clientWidth / 2;
    const top = graphEl.scrollTop + elTop - graphEl.clientHeight / 2;

    graphEl.scrollTo({ left, top, ...scrollOptions });
  }
}

function useGraphviz() {
  const [graphviz, setGraphviz] = useState<Graphviz | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    Graphviz.load()
      .catch(err => {
        console.error('Graphviz failed to load', err);
        return undefined;
      })
      .then(setGraphviz)
      .finally(() => setLoading(false));
  }, []);

  return [graphviz, loading] as const;
}

function updateSelection(
  graph: GraphState,
  modules: Map<string, Module>,
  scrollToSelected = true,
) {
  // Get selection info
  const si = gatherSelectionInfo(graph, modules.values());
  const isSelection = modules.size > 0;

  // Set selection classes for node elements
  let scrollEl: HTMLElement | undefined;
  for (const el of $$('svg .node[data-module]')) {
    const moduleKey = el.dataset.module ?? '';
    const isSelected = si.selectedKeys.has(moduleKey);
    const isUpstream = si.upstreamModuleKeys.has(moduleKey);
    const isDownstream = si.downstreamModuleKeys.has(moduleKey);
    el.classList.toggle('selected', isSelection && isSelected);
    el.classList.toggle('upstream', isSelection && isUpstream);
    el.classList.toggle('downstream', isSelection && isDownstream);
    el.classList.toggle(
      'unselected',
      isSelection && !isSelected && !isUpstream && !isDownstream,
    );

    if (isSelection && isSelected) {
      scrollEl = el;
    }
  }

  // Set selection classes for edge elements
  for (const edge of $$('svg g.edge')) {
    const edgeTitle = $('title', edge)?.textContent ?? '';
    const isUpstream = si.upstreamEdgeKeys.has(edgeTitle);
    const isDownstream = si.downstreamEdgeKeys.has(edgeTitle);
    edge.classList.toggle('upstream', isSelection && isUpstream);
    edge.classList.toggle('downstream', isSelection && isDownstream);
    edge.classList.toggle(
      'unselected',
      isSelection && !isUpstream && !isDownstream,
    );

    // Move edge to end of child list so it's painted last
    if (isUpstream || isDownstream) {
      edge.parentElement?.appendChild(edge);
    }
  }

  if (scrollToSelected) {
    // Scroll to selected element (if multiple elements, this scrolls to last one)
    if (scrollEl) {
      scrollGraphIntoView(scrollEl, { behavior: 'smooth' });
    } else if (!scrollEl) {
      // If no selection and we haven't already scrolled to the root node as part of
      // the initial render, do that now
      scrollGraphIntoView(select('#graph svg .node').node() as HTMLElement);
    }
  }
}

async function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  const colorizer = getColorizer(colorize);

  if (!colorizer) {
    // Unset all node colors
    for (const node of svg.querySelectorAll('g.node path')) {
      node.removeAttribute('style');
    }
    return;
  }

  const moduleEls = svg.querySelectorAll('g.node');

  if (isSimpleColorizer(colorizer)) {
    // For each node in graph
    for (const el of moduleEls) {
      const moduleKey = el.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      const elPath = $('path', el)!;

      // Reset color if there's no module
      if (!m) {
        elPath.style.fill = '';
        continue;
      }

      // Colorize it (async)
      colorizer
        .colorForModule(m)
        .catch(err => {
          console.warn(`Error colorizing ${m.name}: ${err.message}`);
          return null;
        })
        .then(color => {
          elPath.style.fill = color ?? '';
        });
    }
  } else {
    // Bundle up modules
    const modules: Module[] = [];
    for (const el of moduleEls) {
      const moduleKey = el.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      if (m) modules.push(m);
    }

    // Get colors for all modules
    const colors = await colorizer.colorsForModules(modules);

    // Apply colors
    for (const el of moduleEls) {
      const moduleKey = el.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      const elPath = $('path', el)!;
      elPath.style.fill = (m && colors.get(m)) ?? '';
    }
  }
}
