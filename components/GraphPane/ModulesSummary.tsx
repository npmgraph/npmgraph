import React, { useState } from 'react';
import simplur from 'simplur';
import { useGraph } from '../App/App.js';
import { Diagnostic } from './Diagnostic.js';
import { ModuleTable, ModuleTableData } from './ModuleTable.js';

type DetailMode = 'all' | 'repeated' | 'deprecated';

export function ModulesSummary() {
  const [graph] = useGraph();
  const [detailMode, setDetailMode] = useState<DetailMode>();

  if (!graph) return null;

  const caption = simplur`${
    graph?.entryModules.size ?? 0
  } entry module[|s] and ${
    (graph?.moduleInfos.size ?? 0) - (graph?.entryModules.size ?? 0)
  } dependent module[|s]`;

  // Create table data for all modules
  const all: ModuleTableData = new Map();
  for (const { module } of graph.moduleInfos.values() ?? []) {
    const { name } = module.package;
    let modules = all.get(name);
    if (!modules) {
      all.set(name, (modules = []));
    }
    modules.push(module);
  }

  // Create table data for repeated modules
  const repeated: ModuleTableData = new Map(
    [...all.entries()].filter(([, v]) => v.length > 1),
  );

  // Create table data for deprecated modules
  const deprecated: ModuleTableData = new Map();
  for (const { module } of graph.moduleInfos.values() ?? []) {
    if (!module.package.deprecated) continue;

    const { name } = module.package;
    let modules = deprecated.get(name);
    if (!modules) {
      deprecated.set(name, (modules = []));
    }
    modules.push(module);
  }

  return (
    <>
      <h3>Modules</h3>

      <Diagnostic
        message={caption}
        onClick={() => setDetailMode(detailMode === 'all' ? undefined : 'all')}
      >
        <ModuleTable data={all} />
      </Diagnostic>

      {repeated.size > 0 ? (
        <Diagnostic
          type="warn"
          message={simplur`${repeated.size} modules with multiple versions`}
          onClick={() =>
            setDetailMode(detailMode === 'repeated' ? undefined : 'repeated')
          }
        >
          <ModuleTable data={repeated} />
        </Diagnostic>
      ) : null}

      {deprecated.size > 0 ? (
        <Diagnostic
          type="warn"
          message={simplur`${deprecated.size} deprecated module[|s]`}
          onClick={() =>
            setDetailMode(
              detailMode === 'deprecated' ? undefined : 'deprecated',
            )
          }
        >
          <ModuleTable data={deprecated} />
        </Diagnostic>
      ) : null}
    </>
  );
}
