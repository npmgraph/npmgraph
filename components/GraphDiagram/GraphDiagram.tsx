import { Graphviz } from '@hpcc-js/wasm/graphviz';
import { select } from 'd3-selection';
import React, { useEffect, useState } from 'react';
import LoadActivity from '../../lib/LoadActivity.js';
import {
  QueryType,
  getCachedModule,
  queryModuleCache,
} from '../../lib/ModuleCache.js';
import { report } from '../../lib/bugsnag.js';
import {
  COLORIZE_COLORS,
  COLORIZE_MAINTENANCE,
  COLORIZE_MODULE_CJS,
  COLORIZE_MODULE_ESM,
  COLORIZE_OVERALL,
  COLORIZE_POPULARITY,
  COLORIZE_QUALITY,
  PARAM_COLORIZE,
  PARAM_DEPENDENCIES,
  PARAM_VIEW_MODE,
  PARAM_ZOOM,
  ZOOM_FIT_HEIGHT,
  ZOOM_FIT_WIDTH,
  ZOOM_NONE,
} from '../../lib/constants.js';
import { createAbortable } from '../../lib/createAbortable.js';
import $ from '../../lib/dom.js';
import fetchJSON from '../../lib/fetchJSON.js';
import { NPMSIOData } from '../../lib/fetch_types.js';
import { flash } from '../../lib/flash.js';
import { isDefined } from '../../lib/guards.js';
import useGraphSelection from '../../lib/useGraphSelection.js';
import useHashParam from '../../lib/useHashParam.js';
import { useQuery } from '../../lib/useQuery.js';
import { useExcludes, useGraph, usePane } from '../App/App.js';
import './GraphDiagram.scss';
import GraphDiagramDownloadButton from './GraphDiagramDownloadButton.js';
import { GraphDiagramZoomButtons } from './GraphDiagramZoomButtons.js';
import {
  DependencyKey,
  composeDOT,
  getGraphForQuery,
  hslFor,
} from './graph_util.js';

export type ZoomOption =
  | typeof ZOOM_NONE
  | typeof ZOOM_FIT_WIDTH
  | typeof ZOOM_FIT_HEIGHT;

const graphvizP = Graphviz.load();

export default function GraphDiagram({ activity }: { activity: LoadActivity }) {
  const [query] = useQuery();
  const [depTypes] = useHashParam(PARAM_DEPENDENCIES);
  const [, setPane] = usePane();
  const [, setZenMode] = useHashParam(PARAM_VIEW_MODE);
  const [queryType, queryValue, setGraphSelection] = useGraphSelection();
  const [graph, setGraph] = useGraph();
  const [excludes, setExcludes] = useExcludes();
  const [colorize] = useHashParam(PARAM_COLORIZE);
  const [zoom] = useHashParam(PARAM_ZOOM);

  // Dependencies to include for top-level modules
  const dependencyTypes = new Set<DependencyKey>([
    'dependencies',
    'peerDependencies',
  ]);
  depTypes
    .split(/\s*,\s*/)
    .sort()
    .forEach(dtype => dependencyTypes.add(dtype as DependencyKey));

  // Signal for when Graph DOM changes
  const [domSignal, setDomSignal] = useState(0);

  async function handleGraphClick(event: React.MouseEvent) {
    const target = event.target as HTMLDivElement;

    if ($('#graph-controls').contains(target)) return;

    const el = $.up<SVGElement>(target, '.node');

    const moduleKey = el ? $(el, 'title')?.textContent?.trim() : '';
    const module = moduleKey ? getCachedModule(moduleKey) : undefined;

    // Toggle exclude filter?
    if (el && event.shiftKey) {
      if (module) {
        const isIncluded = excludes.includes(module.name);
        if (isIncluded) {
          setExcludes(excludes.filter(n => n !== module.name));
        } else {
          setExcludes([...excludes, module.name]);
        }
      }

      return;
    }

    if (el) setZenMode('');

    setGraphSelection('exact', moduleKey);
    setPane(moduleKey ? 'module' : 'graph');
  }

  function applyZoom() {
    const graphEl = $<HTMLDivElement>('#graph')[0];
    const svg = $<SVGSVGElement>('#graph svg')[0];
    if (!svg) return;

    // Note: Not using svg.getBBox() here because (for some reason???) it's
    // smaller than the actual bounding box
    const vb = svg.getAttribute('viewBox')?.split(' ').map(Number);
    if (!vb) return;

    const [, , w, h] = vb;
    graphEl.classList.toggle(
      'centered',
      zoom === ZOOM_NONE && w < graphEl.clientWidth && h < graphEl.clientHeight,
    );

    switch (zoom) {
      case ZOOM_NONE:
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        break;

      case ZOOM_FIT_WIDTH:
        svg.setAttribute('width', '100%');
        svg.removeAttribute('height');
        break;

      case ZOOM_FIT_HEIGHT:
        svg.removeAttribute('width');
        svg.setAttribute('height', '100%');
        break;
    }

    (select('#graph svg .node').node() as HTMLElement)?.scrollIntoView();
  }

  // Filter for which modules should be shown / collapsed in the graph
  function moduleFilter({ name }: { name: string }) {
    return !excludes?.includes(name);
  }

  // NOTE: Graph rendering can take a significant amount of time.  It is also dependent on UI settings.
  // Thus, it's broken up into different useEffect() actions, below.

  // Effect: Fetch modules
  useEffect(() => {
    const { signal, abort } = createAbortable();

    getGraphForQuery(query, dependencyTypes, moduleFilter).then(newGraph => {
      if (signal.aborted) return; // Check after async

      setGraph(newGraph);
    });

    return abort;
  }, [[...query].sort().join(), [...dependencyTypes].join(), excludes]);

  // Effect: Insert SVG markup into DOM
  useEffect(() => {
    const { signal, abort } = createAbortable();

    // Post-process rendered DOM
    const finish = activity.start('Rendering');

    // Render SVG markup (async)
    (async function () {
      const graphviz = await graphvizP;
      if (signal.aborted) return; // Check after all async stuff

      // Compose SVG markup
      const svgMarkup = graph?.modules.size
        ? await graphviz.dot(composeDOT(graph.modules), 'svg')
        : '<svg />';
      if (signal.aborted) return; // Check after all async stuff

      // Parse markup
      const svgDom = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
        .children[0] as SVGSVGElement;
      svgDom.remove();

      // Remove background element so page background shows thru
      $(svgDom, '.graph > polygon').remove();
      svgDom.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Inject into DOM
      const el = $('#graph');
      select('#graph svg').remove();
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
      for (const el of $<SVGPathElement>('#graph g.node')) {
        // Find module this node represents
        const key = $(el, 'text')[0].textContent;
        if (!key) continue;

        const m = getCachedModule(key);

        const refTypes = graph?.referenceTypes.get(key);

        // Style peer dependencies
        if (refTypes?.has('peerDependencies') && refTypes.size === 1) {
          el.classList.add('peer');
        }

        if (!m) continue;

        if (m?.package.deprecated) {
          el.classList.add('warning');
        }

        if (m.name) {
          el.dataset.module = m.key;
        } else {
          report.warn(Error(`Bad replace: ${key}`));
        }

        if (!moduleFilter(m)) {
          el.classList.add('collapsed');
        }

        const pkg = m.package;
        if (pkg._stub) {
          el.classList.add('stub');
        }
      }

      setPane(graph?.modules.size ? 'graph' : 'info');

      // Signal other hooks that graph DOM has changed
      setDomSignal(domSignal + 1);

      finish?.();
    })();

    return () => {
      finish();
      abort();
    };
  }, [graph]);

  // Effect: render graph selection
  useEffect(
    () => updateSelection(queryType, queryValue),
    [queryType, queryValue, domSignal],
  );

  // Effect: Colorize nodes
  useEffect(() => {
    colorizeGraph($<SVGSVGElement>('#graph svg')[0], colorize);
  }, [colorize, domSignal]);

  // (Re)apply zoom if/when it changes
  useEffect(applyZoom, [zoom, domSignal]);

  return (
    <div id="graph" onClick={handleGraphClick}>
      <div id="graph-controls">
        <GraphDiagramZoomButtons />
        <GraphDiagramDownloadButton />
      </div>
    </div>
  );
}

export function updateSelection(queryType: QueryType, queryValue: string) {
  const modules = queryModuleCache(queryType, queryValue);
  // Locate target element(s)
  const els = [...$<SVGElement>('svg .node[data-module]')].filter(el => {
    modules.has(el.dataset.module ?? '');
    return modules.has(el.dataset.module ?? '');
  });

  // Unselect nodes and edges
  $('svg .node').forEach(el => el.classList.remove('selected'));
  $('svg .edge').forEach(el => el.classList.remove('selected'));

  for (const el of els) {
    el.classList.add('selected');
    el.scrollIntoView({ behavior: 'smooth' });
  }

  // Select edges
  $('.edge title').forEach(title => {
    for (const el of els) {
      const module = getCachedModule(el.dataset.module ?? '');
      if (!module) continue;

      if ((title.textContent ?? '').indexOf(module.key) >= 0) {
        const edge = $.up<SVGPathElement>(title, '.edge');
        if (!edge) continue;

        edge.classList.add('selected');

        // Move edge to end of child list so it's painted last
        edge.parentElement?.appendChild(edge);
      }
    }
  });
}

function colorizeGraph(svg: SVGSVGElement, colorize: string) {
  if (!colorize) {
    $(svg, 'g.node path').attr('style', undefined);
  } else if (colorize == 'bus') {
    for (const el of $<SVGGElement>(svg, 'g.node')) {
      const m = getCachedModule(el.dataset.module ?? '');
      const bus = Math.min(m?.package.maintainers?.length ?? 1, 4);
      $<SVGPathElement>(el, 'path')[0].style.fill = COLORIZE_COLORS[bus - 1];
    }
  } else if (colorize == 'moduleType') {
    for (const el of $<SVGGElement>('#graph g.node')) {
      const moduleName = el.dataset.module;
      if (!moduleName) continue;

      const module = getCachedModule(el.dataset.module ?? '');
      const elPath = $<SVGPathElement>(el, 'path')[0];
      if (module) {
        const url = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
        fetchJSON<{ type: string }>(url)
          .then(pkg => {
            elPath.style.fill =
              pkg.type === 'module' ? COLORIZE_MODULE_ESM : COLORIZE_MODULE_CJS;
          })
          .catch(() => (elPath.style.fill = ''));
      } else {
        elPath.style.fill = '';
      }
    }
  } else {
    let packageNames = $<SVGGElement>('#graph g.node')
      .map(el => getCachedModule(el.dataset.module ?? '')?.name)
      .filter(isDefined);

    // npms.io limits to 250 packages, so query in batches
    const reqs: Promise<Record<string, NPMSIOData> | null>[] = [];
    const MAX_PACKAGES = 250;
    while (packageNames.length) {
      reqs.push(
        fetchJSON<Record<string, NPMSIOData>>(
          'https://api.npms.io/v2/package/mget',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packageNames.slice(0, MAX_PACKAGES)),
          },
        ).catch(err => {
          console.error(err);
          return null;
        }),
      );
      packageNames = packageNames.slice(MAX_PACKAGES);
    }

    Promise.allSettled(reqs).then(results => {
      // Merge results back into a single object
      const combinedResults: { [key: string]: NPMSIOData } = {};
      let rejected = 0;
      for (const result of results) {
        if (result.status == 'rejected') {
          rejected++;
        } else {
          Object.assign(combinedResults, result.value);
        }
      }

      if (rejected) {
        flash(`${rejected} of ${results.length} npms.io requests failed`);
      }

      // Colorize nodes
      for (const el of $(svg, 'g.node')) {
        const key = $(el, 'text')[0].textContent;
        if (!key) return;

        const moduleName = key.replace(/@[\d.]+$/, '');
        const score = combinedResults[moduleName]?.score;
        let fill: number | undefined;
        switch (score && colorize) {
          case COLORIZE_OVERALL:
            fill = score.final;
            break;
          case COLORIZE_QUALITY:
            fill = score.detail.quality;
            break;
          case COLORIZE_POPULARITY:
            fill = score.detail.popularity;
            break;
          case COLORIZE_MAINTENANCE:
            fill = score.detail.maintenance;
            break;
        }

        $<SVGPathElement>(el, 'path')[0].style.fill = fill ? hslFor(fill) : '';
      }
    });
  }
}
