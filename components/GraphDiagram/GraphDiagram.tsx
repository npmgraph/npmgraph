import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { select } from 'd3-selection';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { $, $closestOptional, $optional, $$optional } from 'select-dom';
import { useGlobalState } from '../../lib/GlobalStore.ts';
import type LoadActivity from '../../lib/LoadActivity.ts';
import type Module from '../../lib/Module.ts';
import {
  getCachedModule,
  queryModuleCache,
  QueryType,
} from '../../lib/ModuleCache.ts';
import { report } from '../../lib/bugsnag.ts';
import {
  PaneType,
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_HIDE,
  PARAM_SIZING,
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.ts';
import { createAbortable } from '../../lib/createAbortable.ts';
import { cn } from '../../lib/dom.ts';
import { celebrate, flash } from '../../lib/flash.ts';
import useCollapse from '../../lib/useCollapse.ts';
import useGraphSelection from '../../lib/useGraphSelection.ts';
import useHashParam from '../../lib/useHashParam.ts';
import usePrevious from '../../lib/usePrevious.ts';
import { useQuery } from '../../lib/useQuery.ts';
import {
  getColorizer,
  isSimpleColorizer,
} from '../GraphPane/colorizers/index.ts';
import * as utilities from '../utilities.module.scss';
import * as styles from './GraphDiagram.module.scss';
import './graphviz.css';

import GraphDiagramDownloadButton from './GraphDiagramDownloadButton.tsx';
import { GraphDiagramZoomButtons } from './GraphDiagramZoomButtons.tsx';
import type { DependencyKey, GraphState } from './graph_util.ts';
import {
  composeDOT,
  gatherSelectionInfo,
  getDiagramElement,
  getGraphForQuery,
} from './graph_util.ts';

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
  const sortedQuery = useMemo(() => [...query].toSorted(), [query]);

  // Stable dependency types for use in effects
  const dependencyTypes = useMemo(() => {
    const extra = (depTypes ?? '')
      .split(/\s*,\s*/)
      .map(s => s.trim())
      .filter(Boolean)
      .toSorted() as DependencyKey[];
    return new Set<DependencyKey>(['dependencies', ...extra]);
  }, [depTypes]);

  async function handleGraphClick(event: React.MouseEvent) {
    const { target } = event;
    if (
      !(target instanceof Element) ||
      // Allow opening the link in a new tab
      event.metaKey ||
      $closestOptional(`.${styles.graphControls}`, target)
    ) {
      return;
    }

    const node = $closestOptional('g.node', target);
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
      setPane(PaneType.MODULE);
    }
  }

  function applyZoom() {
    const graphElement = $(`.${styles.graph}`);
    if (!graphElement || !diagramElement) return;

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = diagramElement.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) return;

    const w = vb[2];
    const h = vb[3];
    graphElement.classList.remove(utilities.dBlock);

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
        graphElement.classList.add(utilities.dBlock);
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

        if (
          newGraph.entryModules.size === 0 &&
          newGraph.failedEntryModules.size > 0
        ) {
          setPane(PaneType.INFO);
        }
      },
    );

    return abort;
  }, [sortedQuery, dependencyTypes, collapse, moduleFilter, setGraph, setPane]);

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
        } catch (error) {
          console.error(error);
          flash('Error while rendering graph');
        }
      }
      if (signal.aborted) return; // Check after all async stuff

      // Parse markup
      const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
        .children[0] as SVGSVGElement;
      svgDom.remove();

      // Remove background element so page background shows thru
      $optional('.graph > polygon', svgDom)?.remove();
      svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgDom.classList.add(styles.graphDiagram);

      // Inject into DOM
      const element = $(`.${styles.graph}`)!;
      getDiagramElement()?.remove();
      element.append(svgDom);

      // Inject bg pattern for deprecated modules
      const PATTERN = `<pattern id="warning"
        width="12" height="12"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45 50 50)">
        <line class="line0" stroke-width="6px" x1="3" x2="3" y2="12"/>
        <line class="line1" stroke-width="6px" x1="9" x2="9" y2="12"/>
        </pattern>`;

      select(`.${styles.graph} svg`)
        .insert('defs', ':first-child')
        .html(PATTERN);

      // Decorate DOM nodes with appropriate classname
      for (const nodeElement of $$optional('g.node', element)) {
        // Find module this node represents
        const key = $(':scope > title', nodeElement)?.textContent?.trim();
        if (!key) continue;

        const m = getCachedModule(key);

        if (!m) continue;

        if (m?.package.deprecated) {
          nodeElement.classList.add('warning');
        }

        if (m.name) {
          nodeElement.dataset.module = m.key;
        } else {
          report.warn(new Error(`Bad replace: ${key}`));
        }

        if (!moduleFilter(m)) {
          nodeElement.classList.add('collapsed');
        }

        if (m.isStub) {
          nodeElement.classList.add('stub');
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

  // (Re)apply zoom if/when it changes — useLayoutEffect prevents visual flicker when switching modes
  useLayoutEffect(applyZoom, [zoom, diagramElement]);

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

  if (!graphviz && graphvizLoading) {
    return (
      <div className={cn(styles.graph, styles.graphvizLoading)}>
        {graphvizLoading
          ? 'Loading layout package...'
          : 'Layout package failed to load.'}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.graphControls}>
        <GraphDiagramZoomButtons />
        <GraphDiagramDownloadButton />
      </div>
      <div className={styles.graph} onClick={handleGraphClick}></div>
    </div>
  );
}

// Debug helper for logging when a react variable changes
function logUpdate(name: string, value: unknown) {
  if (!value) {
    if (!idSeen.has(name)) {
      console.log(name, '<undefined>');
      idSeen.add(name);
    }
    return;
  }
  if (idSeen.has(value)) return;
  idSeen.add(value);
  console.log(name, 'updated ->', value);
}

function scrollGraphIntoView(
  element: Element | null,
  scrollOptions?: ScrollToOptions,
) {
  const graphElement = $optional(`.${styles.graph}`);
  if (graphElement && element) {
    // Bug: graphEl.scrollIntoView() doesn't work for SVG elements in
    // Firefox.  And even in Chrome it just scrolls the element to *barely*
    // be in view, which isn't really what we want.  (We'd like element to
    // be centered in the view.)  So, instead, we manually compute the
    // scroll coordinates.
    const { top: elementTop, left: elementLeft } =
      element.getBoundingClientRect();
    const left =
      graphElement.scrollLeft + elementLeft - graphElement.clientWidth / 2;
    const top =
      graphElement.scrollTop + elementTop - graphElement.clientHeight / 2;

    graphElement.scrollTo({ left, top, ...scrollOptions });
  }
}

function useGraphviz() {
  const [graphviz, setGraphviz] = useState<Graphviz | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Graphviz.load()
      .catch(error => {
        console.error('Graphviz failed to load', error);
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
  let scrollElement: HTMLElement | undefined;
  for (const element of $$optional('svg .node[data-module]')) {
    const moduleKey = element.dataset.module ?? '';
    const isSelected = si.selectedKeys.has(moduleKey);
    const isUpstream = si.upstreamModuleKeys.has(moduleKey);
    const isDownstream = si.downstreamModuleKeys.has(moduleKey);
    element.classList.toggle('selected', isSelection && isSelected);
    element.classList.toggle('upstream', isSelection && isUpstream);
    element.classList.toggle('downstream', isSelection && isDownstream);
    element.classList.toggle(
      'unselected',
      isSelection && !isSelected && !isUpstream && !isDownstream,
    );

    if (isSelection && isSelected) {
      scrollElement = element;
    }
  }

  // Set selection classes for edge elements
  for (const edge of $$optional('svg g.edge')) {
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
      edge.parentElement?.append(edge);
    }
  }

  if (scrollToSelected) {
    // Scroll to selected element (if multiple elements, this scrolls to last one)
    if (scrollElement) {
      scrollGraphIntoView(scrollElement, { behavior: 'smooth' });
    } else if (!scrollElement) {
      // If no selection and we haven't already scrolled to the root node as part of
      // the initial render, do that now
      scrollGraphIntoView(
        select(`.${styles.graph} svg .node`).node() as HTMLElement,
      );
    }
  }
}

async function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  const colorizer = getColorizer(colorize);

  if (!colorizer) {
    // Unset all node colors
    for (const node of $$optional('g.node path', svg)) {
      node.removeAttribute('style');
    }
    return;
  }

  const moduleEls = $$optional('g.node', svg);

  if (isSimpleColorizer(colorizer)) {
    // For each node in graph
    for (const element of moduleEls) {
      const moduleKey = element.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      const elementPath = $('path', element)!;

      // Reset color if there's no module
      if (!m) {
        elementPath.style.fill = '';
        continue;
      }

      // Colorize it (async)
      colorizer
        .colorForModule(m)
        .catch(error => {
          console.warn(`Error colorizing ${m.name}: ${error.message}`);
          return null;
        })
        .then(color => {
          elementPath.style.fill = color ?? '';
        });
    }
  } else {
    // Bundle up modules
    const modules: Module[] = [];
    for (const element of moduleEls) {
      const moduleKey = element.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      if (m) modules.push(m);
    }

    // Get colors for all modules
    const colors = await colorizer.colorsForModules(modules);

    // Apply colors
    for (const element of moduleEls) {
      const moduleKey = element.dataset.module;
      const m = moduleKey && getCachedModule(moduleKey);
      const elementPath = $('path', element)!;
      elementPath.style.fill = (m && colors.get(m)) ?? '';
    }
  }
}
