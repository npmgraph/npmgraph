import React from 'react';
import simplur from 'simplur';
import Module from '../../lib/Module.js';
import { useGraph } from '../App/App.js';
import { Diagnostic } from './Diagnostic.js';
import { OwnerTable } from './OwnerTable.js';

export type OwnerTableData = Map<string, Module[]>;

export function OwnersSummary() {
  const [graph] = useGraph();

  if (!graph) return null;

  // Create table data for all modules
  const all: OwnerTableData = new Map();
  for (const { module } of graph.moduleInfos.values() ?? []) {
    if (module.isStub) continue;
    const { maintainers } = module.package;
    if (!maintainers) {
      console.log('No maintainers for package', module);
      continue;
    }
    for (const maintainer of maintainers) {
      const name =
        typeof maintainer === 'string' ? maintainer : maintainer.name;
      if (!name) continue;

      let modules = all.get(name);
      if (!modules) {
        all.set(name, (modules = []));
      }
      modules.push(module);
    }
  }

  const tableData = all;

  const caption = simplur`${tableData.size} maintainer[|s]`;

  return (
    <>
      <h3>Maintainers</h3>

      <Diagnostic message={caption} onClick={() => {}}>
        {tableData ? <OwnerTable data={tableData} /> : null}
      </Diagnostic>
    </>
  );
}
